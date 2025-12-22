/**
 * Remote Control Server - Child Process
 * 
 * This runs as a separate process and communicates with the main Electron process
 * via process.send() and process.on('message')
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { networkInterfaces } from "node:os";
import { WebSocketServer, WebSocket } from "ws";
import type {
	MainToRemoteMessage,
	RemoteToMainMessage,
	WSClientMessage,
	WSServerMessage,
	RemoteAppState,
	ClientInfo,
	RemoteSong,
	RemoteTheme,
	RemoteScheduleItem,
	RemoteScriptureChapter,
	RemoteSongLyric,
	RemoteTranslation,
} from "./types.js";
import { getWebUI } from "./web-ui.js";

// Debug logging
const LOG_FILE = path.join(process.cwd(), "remote-server.log");

function log(level: "INFO" | "DEBUG" | "ERROR", message: string, data?: unknown): void {
	const timestamp = new Date().toISOString();
	const logLine = `[${timestamp}] [${level}] ${message}${data !== undefined ? " " + JSON.stringify(data) : ""}\n`;
	
	// Write to file
	fs.appendFileSync(LOG_FILE, logLine);
	
	// Also write to console
	console.log(logLine.trim());
}

// State
let server: http.Server | null = null;
let wss: WebSocketServer | null = null;
const clients = new Map<string, { ws: WebSocket; info: ClientInfo }>();
let currentState: RemoteAppState | null = null;
let cachedTranslations: RemoteTranslation[] = [];

// Send message to main process
function sendToMain(message: RemoteToMainMessage): void {
	log("DEBUG", "Sending to main:", message);
	if (process.send) {
		process.send(message);
	}
}

// Get local network addresses
function getLocalAddresses(): string[] {
	const addresses: string[] = [];
	const interfaces = networkInterfaces();
	
	for (const name of Object.keys(interfaces)) {
		const nets = interfaces[name];
		if (!nets) continue;
		
		for (const net of nets) {
			// Skip internal and non-IPv4 addresses
			if (net.internal || net.family !== "IPv4") continue;
			addresses.push(net.address);
		}
	}
	
	return addresses;
}

// Generate client ID
function generateClientId(): string {
	return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Broadcast to all connected clients
function broadcast(message: WSServerMessage): void {
	log("DEBUG", "Broadcasting to all clients:", { type: message.type, clientCount: clients.size });
	const data = JSON.stringify(message);
	for (const { ws } of clients.values()) {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(data);
		}
	}
}

// Send to specific client
function sendToClient(clientId: string, message: WSServerMessage): void {
	const client = clients.get(clientId);
	if (client && client.ws.readyState === WebSocket.OPEN) {
		client.ws.send(JSON.stringify(message));
	}
}

// Handle WebSocket client message
function handleClientMessage(clientId: string, message: WSClientMessage): void {
	log("INFO", `Received message from client ${clientId}:`, message);
	
	switch (message.type) {
		case "get-songs":
			sendToMain({ type: "request-songs" });
			break;
			
		case "get-song-lyrics":
			log("DEBUG", `Requesting lyrics for song ID: ${message.songId}`);
			sendToMain({ type: "request-song-lyrics", songId: message.songId });
			break;
			
		case "get-scripture":
			log("INFO", `Scripture request: ${message.book} ${message.chapter} (${message.version})`);
			sendToMain({
				type: "request-scripture",
				book: message.book,
				chapter: message.chapter,
				version: message.version,
			});
			break;
			
		case "get-translations":
			log("DEBUG", "Requesting translations");
			if (cachedTranslations.length > 0) {
				sendToClient(clientId, { type: "translations", translations: cachedTranslations });
			} else {
				sendToMain({ type: "request-translations" });
			}
			break;
			
		case "get-themes":
			sendToMain({ type: "request-themes" });
			break;
			
		case "get-schedule":
			sendToMain({ type: "request-schedule" });
			break;
			
		case "go-live":
			log("INFO", "Go live request:", message.item);
			sendToMain({ type: "go-live", item: message.item });
			break;
			
		case "go-blank":
			sendToMain({ type: "go-blank" });
			break;
			
		case "navigate":
			sendToMain({ type: "navigate", direction: message.direction });
			break;
			
		case "search-songs":
			sendToMain({ type: "search-songs", query: message.query });
			break;
			
		case "search-scripture":
			sendToMain({
				type: "search-scripture",
				query: message.query,
				version: message.version,
			});
			break;
			
		case "add-to-schedule":
			log("INFO", "Add to schedule request:", message.item);
			sendToMain({ type: "add-to-schedule", item: message.item });
			break;
			
		case "ping":
			sendToClient(clientId, { type: "state", state: currentState! });
			break;
	}
}

// Start server
function startServer(port: number): void {
	if (server) {
		sendToMain({ type: "error", error: "Server already running" });
		return;
	}
	
	try {
		server = http.createServer((req, res) => {
			// CORS headers
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
			res.setHeader("Access-Control-Allow-Headers", "Content-Type");
			
			if (req.method === "OPTIONS") {
				res.writeHead(204);
				res.end();
				return;
			}
			
			// Serve web UI
			if (req.url === "/" || req.url === "/index.html") {
				res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
				res.end(getWebUI());
				return;
			}
			
			// Health check
			if (req.url === "/health") {
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ status: "ok", clients: clients.size }));
				return;
			}
			
			// 404
			res.writeHead(404);
			res.end("Not Found");
		});
		
		// Create WebSocket server
		wss = new WebSocketServer({ server, path: "/ws" });
		
		wss.on("connection", (ws, req) => {
			const clientId = generateClientId();
			const clientInfo: ClientInfo = {
				id: clientId,
				ip: req.socket.remoteAddress || "unknown",
				userAgent: req.headers["user-agent"] || "unknown",
				connectedAt: Date.now(),
			};
			
			clients.set(clientId, { ws, info: clientInfo });
			
			// Notify main process
			sendToMain({ type: "client-connected", clientId, clientInfo });
			
			// Send connected message to client
			ws.send(JSON.stringify({ type: "connected", clientId }));
			
			// Send current state if available
			if (currentState) {
				ws.send(JSON.stringify({ type: "state", state: currentState }));
			}
			
			// Handle messages
			ws.on("message", (data) => {
				try {
					const message = JSON.parse(data.toString()) as WSClientMessage;
					handleClientMessage(clientId, message);
				} catch (err) {
					console.error("Invalid message:", err);
				}
			});
			
			// Handle disconnect
			ws.on("close", () => {
				clients.delete(clientId);
				sendToMain({ type: "client-disconnected", clientId });
			});
			
			ws.on("error", (err) => {
				console.error("WebSocket error:", err);
				clients.delete(clientId);
			});
		});
		
		server.listen(port, "0.0.0.0", () => {
			const addresses = getLocalAddresses();
			sendToMain({ type: "started", port, addresses });
		});
		
		server.on("error", (err: NodeJS.ErrnoException) => {
			if (err.code === "EADDRINUSE") {
				sendToMain({ type: "error", error: `Port ${port} is already in use` });
			} else {
				sendToMain({ type: "error", error: err.message });
			}
			server = null;
			wss = null;
		});
	} catch (err) {
		sendToMain({ type: "error", error: (err as Error).message });
	}
}

// Stop server
function stopServer(): void {
	if (wss) {
		// Close all client connections
		for (const { ws } of clients.values()) {
			ws.close();
		}
		clients.clear();
		wss.close();
		wss = null;
	}
	
	if (server) {
		server.close();
		server = null;
	}
	
	sendToMain({ type: "stopped" });
}

// Handle messages from main process
process.on("message", (message: MainToRemoteMessage) => {
	log("DEBUG", "Received from main:", message);
	switch (message.type) {
		case "start":
			startServer(message.port);
			break;
			
		case "stop":
			stopServer();
			break;
			
		case "state-update":
			currentState = message.state;
			broadcast({ type: "state", state: message.state });
			break;
			
		case "songs-list":
			broadcast({ type: "songs", songs: message.songs });
			break;
			
		case "song-lyrics":
			broadcast({ type: "song-lyrics", songId: message.songId, lyrics: message.lyrics });
			break;
			
		case "scripture-chapter":
			log("INFO", "Scripture chapter received:", message.data);
			broadcast({ type: "scripture", data: message.data });
			break;
			
		case "translations-list":
			log("INFO", "Translations received:", message.translations);
			cachedTranslations = message.translations;
			broadcast({ type: "translations", translations: message.translations });
			break;
			
		case "themes-list":
			broadcast({ type: "themes", themes: message.themes });
			break;
			
		case "schedule-list":
			broadcast({ type: "schedule", items: message.items });
			break;
	}
});

// Handle process termination
process.on("SIGTERM", () => {
	stopServer();
	process.exit(0);
});

process.on("SIGINT", () => {
	stopServer();
	process.exit(0);
});

console.log("Remote server process started");
