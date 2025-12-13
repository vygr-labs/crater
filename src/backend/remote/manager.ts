/**
 * Remote Control Manager
 * 
 * Manages the child process that runs the remote control server.
 * Handles IPC between main process and the server.
 */

import { fork, ChildProcess } from "node:child_process";
import path from "node:path";
import { BrowserWindow, ipcMain } from "electron";
import type {
	MainToRemoteMessage,
	RemoteToMainMessage,
	RemoteAppState,
	RemoteSong,
	RemoteScheduleItem,
	ClientInfo,
	RemoteSongLyric,
} from "./types.js";
import { fetchAllSongs, fetchSongLyrics, searchSongs } from "../database/song-operations.js";
import { fetchChapter, searchScriptures } from "../database/bible-operations.js";
import logger from "../logger.js";
import { __dirname } from "../setup.js";

// State
let serverProcess: ChildProcess | null = null;
let isRunning = false;
let currentPort = 0;
let serverAddresses: string[] = [];
let connectedClients: Map<string, ClientInfo> = new Map();

// Reference to app window for sending IPC
let appWindowRef: BrowserWindow | null = null;

// Callback for handling remote commands (set by main.ts)
let onRemoteCommandCallback: ((command: string, data: unknown) => void) | null = null;

/**
 * Set the app window reference for IPC communication
 */
export function setAppWindow(window: BrowserWindow): void {
	appWindowRef = window;
}

/**
 * Set callback for remote commands
 */
export function setRemoteCommandHandler(
	callback: (command: string, data: unknown) => void
): void {
	onRemoteCommandCallback = callback;
}

/**
 * Start the remote control server
 */
export function startRemoteServer(port: number = 3456): Promise<{ port: number; addresses: string[] }> {
	return new Promise((resolve, reject) => {
		if (serverProcess && isRunning) {
			reject(new Error("Server is already running"));
			return;
		}
		
		try {
			// Fork the server process
			const serverPath = path.join(__dirname, "remote", "server.js");
			logger.info("Starting remote server from:", serverPath);
			
			serverProcess = fork(serverPath, [], {
				stdio: ["pipe", "pipe", "pipe", "ipc"],
			});
			
			// Handle stdout/stderr
			serverProcess.stdout?.on("data", (data) => {
				logger.debug("[Remote Server]", data.toString().trim());
			});
			
			serverProcess.stderr?.on("data", (data) => {
				logger.error("[Remote Server Error]", data.toString().trim());
			});
			
			// Handle messages from server
			serverProcess.on("message", (message: RemoteToMainMessage) => {
				handleServerMessage(message, resolve, reject);
			});
			
			serverProcess.on("error", (err) => {
				logger.error("Remote server process error:", err);
				isRunning = false;
				reject(err);
			});
			
			serverProcess.on("exit", (code) => {
				logger.info("Remote server process exited with code:", code);
				isRunning = false;
				serverProcess = null;
				currentPort = 0;
				serverAddresses = [];
				connectedClients.clear();
				
				// Notify renderer
				notifyRenderer("remote-server-stopped", {});
			});
			
			// Send start command
			sendToServer({ type: "start", port });
		} catch (err) {
			logger.error("Failed to start remote server:", err);
			reject(err);
		}
	});
}

/**
 * Stop the remote control server
 */
export function stopRemoteServer(): Promise<void> {
	return new Promise((resolve) => {
		if (!serverProcess) {
			resolve();
			return;
		}
		
		sendToServer({ type: "stop" });
		
		// Give it time to clean up, then force kill
		setTimeout(() => {
			if (serverProcess) {
				serverProcess.kill();
				serverProcess = null;
			}
			isRunning = false;
			currentPort = 0;
			serverAddresses = [];
			connectedClients.clear();
			resolve();
		}, 1000);
	});
}

/**
 * Get server status
 */
export function getRemoteServerStatus(): {
	running: boolean;
	port: number;
	addresses: string[];
	clients: ClientInfo[];
} {
	return {
		running: isRunning,
		port: currentPort,
		addresses: serverAddresses,
		clients: Array.from(connectedClients.values()),
	};
}

/**
 * Update the current app state (called from renderer)
 */
export function updateRemoteState(state: RemoteAppState): void {
	if (serverProcess && isRunning) {
		sendToServer({ type: "state-update", state });
	}
}

/**
 * Send message to server process
 */
function sendToServer(message: MainToRemoteMessage): void {
	if (serverProcess && serverProcess.connected) {
		serverProcess.send(message);
	}
}

/**
 * Handle messages from server process
 */
function handleServerMessage(
	message: RemoteToMainMessage,
	resolveStart?: (value: { port: number; addresses: string[] }) => void,
	rejectStart?: (reason: Error) => void
): void {
	switch (message.type) {
		case "started":
			isRunning = true;
			currentPort = message.port;
			serverAddresses = message.addresses;
			logger.info(`Remote server started on port ${message.port}`);
			logger.info("Available addresses:", message.addresses);
			
			if (resolveStart) {
				resolveStart({ port: message.port, addresses: message.addresses });
			}
			
			notifyRenderer("remote-server-started", {
				port: message.port,
				addresses: message.addresses,
			});
			break;
			
		case "stopped":
			isRunning = false;
			currentPort = 0;
			serverAddresses = [];
			connectedClients.clear();
			logger.info("Remote server stopped");
			notifyRenderer("remote-server-stopped", {});
			break;
			
		case "error":
			logger.error("Remote server error:", message.error);
			if (rejectStart) {
				rejectStart(new Error(message.error));
			}
			notifyRenderer("remote-server-error", { error: message.error });
			break;
			
		case "client-connected":
			connectedClients.set(message.clientId, message.clientInfo);
			logger.info("Client connected:", message.clientInfo.ip);
			notifyRenderer("remote-client-connected", {
				clientId: message.clientId,
				clientInfo: message.clientInfo,
			});
			break;
			
		case "client-disconnected":
			connectedClients.delete(message.clientId);
			logger.info("Client disconnected:", message.clientId);
			notifyRenderer("remote-client-disconnected", { clientId: message.clientId });
			break;
			
		case "request-songs":
			handleSongsRequest();
			break;
			
		case "request-song-lyrics":
			handleSongLyricsRequest(message.songId);
			break;
			
		case "request-scripture":
			handleScriptureRequest(message.book, message.chapter, message.version);
			break;
			
		case "request-themes":
			handleThemesRequest();
			break;
			
		case "request-schedule":
			handleScheduleRequest();
			break;
			
		case "go-live":
			handleGoLive(message.item);
			break;
			
		case "go-blank":
			handleGoBlank();
			break;
			
		case "navigate":
			handleNavigate(message.direction);
			break;
			
		case "search-songs":
			handleSearchSongs(message.query);
			break;
			
		case "search-scripture":
			handleSearchScripture(message.query, message.version);
			break;
	}
}

/**
 * Notify renderer process
 */
function notifyRenderer(channel: string, data: unknown): void {
	if (appWindowRef && !appWindowRef.isDestroyed()) {
		appWindowRef.webContents.send(channel, data);
	}
}

/**
 * Handle songs request
 */
function handleSongsRequest(): void {
	try {
		const songs = fetchAllSongs();
		const remoteSongs: RemoteSong[] = songs.map((s) => ({
			id: s.id,
			title: s.title,
			author: s.author,
			themeId: s.theme_id,
		}));
		sendToServer({ type: "songs-list", songs: remoteSongs });
	} catch (err) {
		logger.error("Failed to fetch songs:", err);
	}
}

/**
 * Handle song lyrics request
 */
function handleSongLyricsRequest(songId: number): void {
	try {
		const lyrics = fetchSongLyrics(songId);
		const remoteLyrics: RemoteSongLyric[] = lyrics.map((l) => ({
			label: l.label,
			text: Array.isArray(l.text) ? l.text : [l.text],
		}));
		
		// Send via broadcast with song ID
		if (serverProcess && isRunning) {
			serverProcess.send({
				type: "song-lyrics",
				songId,
				lyrics: remoteLyrics,
			});
		}
	} catch (err) {
		logger.error("Failed to fetch song lyrics:", err);
	}
}

/**
 * Handle scripture request
 */
function handleScriptureRequest(book: string, chapter: number, version: string): void {
	try {
		const verses = fetchChapter({ book, chapter, version });
		sendToServer({
			type: "scripture-chapter",
			data: {
				book,
				chapter,
				version,
				verses: verses.map((v) => ({ verse: v.verse, text: v.text })),
			},
		});
	} catch (err) {
		logger.error("Failed to fetch scripture:", err);
	}
}

/**
 * Handle themes request
 */
function handleThemesRequest(): void {
	// TODO: Implement themes request
	sendToServer({ type: "themes-list", themes: [] });
}

/**
 * Handle schedule request
 */
function handleScheduleRequest(): void {
	// Request schedule from renderer
	notifyRenderer("remote-request-schedule", {});
}

/**
 * Send schedule to remote clients
 */
export function sendScheduleToRemote(items: RemoteScheduleItem[]): void {
	sendToServer({ type: "schedule-list", items });
}

/**
 * Handle go live command
 */
function handleGoLive(item: unknown): void {
	if (onRemoteCommandCallback) {
		onRemoteCommandCallback("go-live", item);
	}
	notifyRenderer("remote-go-live", item);
}

/**
 * Handle go blank command
 */
function handleGoBlank(): void {
	if (onRemoteCommandCallback) {
		onRemoteCommandCallback("go-blank", {});
	}
	notifyRenderer("remote-go-blank", {});
}

/**
 * Handle navigate command
 */
function handleNavigate(direction: "next" | "prev"): void {
	if (onRemoteCommandCallback) {
		onRemoteCommandCallback("navigate", { direction });
	}
	notifyRenderer("remote-navigate", { direction });
}

/**
 * Handle search songs
 */
function handleSearchSongs(query: string): void {
	try {
		const results = searchSongs(query);
		const remoteSongs: RemoteSong[] = results.map((s) => ({
			id: s.id,
			title: s.title,
			author: s.author,
			themeId: s.theme_id,
		}));
		sendToServer({ type: "songs-list", songs: remoteSongs });
	} catch (err) {
		logger.error("Failed to search songs:", err);
	}
}

/**
 * Handle search scripture
 */
function handleSearchScripture(query: string, version?: string): void {
	try {
		const results = searchScriptures(query, version);
		// TODO: Format and send results
		logger.debug("Scripture search results:", results.length);
	} catch (err) {
		logger.error("Failed to search scripture:", err);
	}
}

/**
 * Register IPC handlers for remote control
 */
export function registerRemoteIpcHandlers(): void {
	ipcMain.handle("remote-server-start", async (_, port?: number) => {
		try {
			const result = await startRemoteServer(port);
			return { success: true, ...result };
		} catch (err) {
			return { success: false, error: (err as Error).message };
		}
	});
	
	ipcMain.handle("remote-server-stop", async () => {
		try {
			await stopRemoteServer();
			return { success: true };
		} catch (err) {
			return { success: false, error: (err as Error).message };
		}
	});
	
	ipcMain.handle("remote-server-status", () => {
		return getRemoteServerStatus();
	});
	
	ipcMain.on("remote-state-update", (_, state: RemoteAppState) => {
		updateRemoteState(state);
	});
	
	ipcMain.on("remote-schedule-update", (_, items: RemoteScheduleItem[]) => {
		sendScheduleToRemote(items);
	});
}
