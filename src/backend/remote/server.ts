/**
 * Remote Control Server - Child Process
 * 
 * This runs as a separate process and communicates with the main Electron process
 * via process.send() and process.on('message')
 */

import http from "node:http";
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
} from "./types.js";

// State
let server: http.Server | null = null;
let wss: WebSocketServer | null = null;
const clients = new Map<string, { ws: WebSocket; info: ClientInfo }>();
let currentState: RemoteAppState | null = null;

// Send message to main process
function sendToMain(message: RemoteToMainMessage): void {
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
	switch (message.type) {
		case "get-songs":
			sendToMain({ type: "request-songs" });
			break;
			
		case "get-song-lyrics":
			sendToMain({ type: "request-song-lyrics", songId: message.songId });
			break;
			
		case "get-scripture":
			sendToMain({
				type: "request-scripture",
				book: message.book,
				chapter: message.chapter,
				version: message.version,
			});
			break;
			
		case "get-themes":
			sendToMain({ type: "request-themes" });
			break;
			
		case "get-schedule":
			sendToMain({ type: "request-schedule" });
			break;
			
		case "go-live":
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
			
		case "ping":
			sendToClient(clientId, { type: "state", state: currentState! });
			break;
	}
}

// HTML for the remote control web UI
function getWebUI(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>Crater Remote</title>
	<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>">
	<style>
		* {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}
		
		:root {
			--bg: #0a0a0a;
			--bg-card: #18181b;
			--bg-hover: #27272a;
			--border: #3f3f46;
			--text: #fafafa;
			--text-muted: #a1a1aa;
			--primary: #3b82f6;
			--primary-hover: #2563eb;
			--success: #22c55e;
			--danger: #ef4444;
		}
		
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			background: var(--bg);
			color: var(--text);
			min-height: 100vh;
			padding-bottom: env(safe-area-inset-bottom);
		}
		
		/* Header */
		.header {
			position: sticky;
			top: 0;
			z-index: 100;
			background: var(--bg-card);
			border-bottom: 1px solid var(--border);
			padding: 12px 16px;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}
		
		.header h1 {
			font-size: 18px;
			font-weight: 600;
		}
		
		.status {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 12px;
			color: var(--text-muted);
		}
		
		.status-dot {
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: var(--danger);
		}
		
		.status-dot.connected {
			background: var(--success);
		}
		
		/* Tabs */
		.tabs {
			display: flex;
			background: var(--bg-card);
			border-bottom: 1px solid var(--border);
			overflow-x: auto;
		}
		
		.tab {
			flex: 1;
			min-width: 80px;
			padding: 12px 16px;
			background: none;
			border: none;
			color: var(--text-muted);
			font-size: 14px;
			font-weight: 500;
			cursor: pointer;
			border-bottom: 2px solid transparent;
			white-space: nowrap;
		}
		
		.tab.active {
			color: var(--primary);
			border-bottom-color: var(--primary);
		}
		
		/* Content */
		.content {
			padding: 16px;
		}
		
		.panel {
			display: none;
		}
		
		.panel.active {
			display: block;
		}
		
		/* Search */
		.search-box {
			position: relative;
			margin-bottom: 16px;
		}
		
		.search-box input {
			width: 100%;
			padding: 12px 16px;
			padding-left: 40px;
			background: var(--bg-card);
			border: 1px solid var(--border);
			border-radius: 8px;
			color: var(--text);
			font-size: 16px;
		}
		
		.search-box input::placeholder {
			color: var(--text-muted);
		}
		
		.search-box svg {
			position: absolute;
			left: 12px;
			top: 50%;
			transform: translateY(-50%);
			width: 20px;
			height: 20px;
			color: var(--text-muted);
		}
		
		/* List items */
		.list {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
		
		.list-item {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 12px;
			background: var(--bg-card);
			border: 1px solid var(--border);
			border-radius: 8px;
			cursor: pointer;
			transition: background 0.15s;
		}
		
		.list-item:hover, .list-item:active {
			background: var(--bg-hover);
		}
		
		.list-item.active {
			border-color: var(--primary);
			background: rgba(59, 130, 246, 0.1);
		}
		
		.list-item-icon {
			width: 40px;
			height: 40px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: var(--bg);
			border-radius: 8px;
			font-size: 20px;
		}
		
		.list-item-content {
			flex: 1;
			min-width: 0;
		}
		
		.list-item-title {
			font-size: 14px;
			font-weight: 500;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		
		.list-item-subtitle {
			font-size: 12px;
			color: var(--text-muted);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		
		/* Slides */
		.slides-container {
			margin-top: 16px;
		}
		
		.slide {
			padding: 16px;
			background: var(--bg-card);
			border: 1px solid var(--border);
			border-radius: 8px;
			margin-bottom: 8px;
			cursor: pointer;
			transition: all 0.15s;
		}
		
		.slide:hover, .slide:active {
			background: var(--bg-hover);
		}
		
		.slide.active {
			border-color: var(--primary);
			background: rgba(59, 130, 246, 0.1);
		}
		
		.slide-label {
			font-size: 11px;
			font-weight: 600;
			color: var(--primary);
			text-transform: uppercase;
			margin-bottom: 8px;
		}
		
		.slide-text {
			font-size: 14px;
			line-height: 1.5;
			white-space: pre-wrap;
		}
		
		/* Scripture selector */
		.scripture-selector {
			display: grid;
			grid-template-columns: 1fr 1fr 1fr;
			gap: 8px;
			margin-bottom: 16px;
		}
		
		.scripture-selector select {
			padding: 12px;
			background: var(--bg-card);
			border: 1px solid var(--border);
			border-radius: 8px;
			color: var(--text);
			font-size: 14px;
		}
		
		/* Live controls */
		.live-controls {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			background: var(--bg-card);
			border-top: 1px solid var(--border);
			padding: 12px 16px;
			padding-bottom: calc(12px + env(safe-area-inset-bottom));
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		
		.now-playing {
			display: flex;
			align-items: center;
			gap: 12px;
		}
		
		.now-playing-info {
			flex: 1;
			min-width: 0;
		}
		
		.now-playing-title {
			font-size: 14px;
			font-weight: 500;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		
		.now-playing-slide {
			font-size: 12px;
			color: var(--text-muted);
		}
		
		.nav-buttons {
			display: flex;
			gap: 8px;
		}
		
		.nav-btn {
			flex: 1;
			padding: 14px;
			background: var(--bg);
			border: 1px solid var(--border);
			border-radius: 8px;
			color: var(--text);
			font-size: 16px;
			font-weight: 500;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			transition: all 0.15s;
		}
		
		.nav-btn:hover, .nav-btn:active {
			background: var(--bg-hover);
		}
		
		.nav-btn.primary {
			background: var(--primary);
			border-color: var(--primary);
		}
		
		.nav-btn.primary:hover, .nav-btn.primary:active {
			background: var(--primary-hover);
		}
		
		.nav-btn.danger {
			background: var(--danger);
			border-color: var(--danger);
		}
		
		/* Empty state */
		.empty-state {
			text-align: center;
			padding: 40px 20px;
			color: var(--text-muted);
		}
		
		.empty-state svg {
			width: 48px;
			height: 48px;
			margin-bottom: 16px;
			opacity: 0.5;
		}
		
		/* Loading */
		.loading {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 40px;
		}
		
		.spinner {
			width: 32px;
			height: 32px;
			border: 3px solid var(--border);
			border-top-color: var(--primary);
			border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}
		
		@keyframes spin {
			to { transform: rotate(360deg); }
		}
		
		/* Utility */
		.mb-16 { margin-bottom: 16px; }
		.pb-140 { padding-bottom: 140px; }
	</style>
</head>
<body>
	<header class="header">
		<h1>📖 Crater Remote</h1>
		<div class="status">
			<div class="status-dot" id="statusDot"></div>
			<span id="statusText">Connecting...</span>
		</div>
	</header>
	
	<nav class="tabs">
		<button class="tab active" data-tab="songs">Songs</button>
		<button class="tab" data-tab="scripture">Scripture</button>
		<button class="tab" data-tab="schedule">Schedule</button>
	</nav>
	
	<main class="content pb-140">
		<!-- Songs Panel -->
		<div class="panel active" id="songsPanel">
			<div class="search-box">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input type="search" id="songSearch" placeholder="Search songs...">
			</div>
			<div class="list" id="songsList">
				<div class="loading"><div class="spinner"></div></div>
			</div>
			<div class="slides-container" id="songSlides" style="display: none;"></div>
		</div>
		
		<!-- Scripture Panel -->
		<div class="panel" id="scripturePanel">
			<div class="scripture-selector">
				<select id="bookSelect">
					<option value="">Book</option>
				</select>
				<select id="chapterSelect">
					<option value="">Chapter</option>
				</select>
				<select id="versionSelect">
					<option value="NKJV">NKJV</option>
					<option value="NIV">NIV</option>
					<option value="NLT">NLT</option>
				</select>
			</div>
			<div class="list" id="versesList">
				<div class="empty-state">
					<p>Select a book and chapter</p>
				</div>
			</div>
		</div>
		
		<!-- Schedule Panel -->
		<div class="panel" id="schedulePanel">
			<div class="list" id="scheduleList">
				<div class="loading"><div class="spinner"></div></div>
			</div>
		</div>
	</main>
	
	<footer class="live-controls">
		<div class="now-playing">
			<div class="now-playing-info">
				<div class="now-playing-title" id="nowPlayingTitle">Nothing live</div>
				<div class="now-playing-slide" id="nowPlayingSlide">-</div>
			</div>
		</div>
		<div class="nav-buttons">
			<button class="nav-btn" id="prevBtn">← Prev</button>
			<button class="nav-btn danger" id="blankBtn">Blank</button>
			<button class="nav-btn" id="nextBtn">Next →</button>
		</div>
	</footer>
	
	<script>
		// WebSocket connection
		let ws = null;
		let reconnectTimer = null;
		let state = null;
		let songs = [];
		let selectedSong = null;
		let songLyrics = {};
		
		// Bible data
		const bibleBooks = [
			'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
			'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
			'1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
			'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
			'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
			'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
			'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
			'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
			'Matthew', 'Mark', 'Luke', 'John', 'Acts',
			'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
			'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy',
			'2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
			'1 Peter', '2 Peter', '1 John', '2 John', '3 John',
			'Jude', 'Revelation'
		];
		
		const chapterCounts = {
			'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
			'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
			'1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36, 'Ezra': 10,
			'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150, 'Proverbs': 31,
			'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66, 'Jeremiah': 52, 'Lamentations': 5,
			'Ezekiel': 48, 'Daniel': 12, 'Hosea': 14, 'Joel': 3, 'Amos': 9,
			'Obadiah': 1, 'Jonah': 4, 'Micah': 7, 'Nahum': 3, 'Habakkuk': 3,
			'Zephaniah': 3, 'Haggai': 2, 'Zechariah': 14, 'Malachi': 4,
			'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
			'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6, 'Ephesians': 6,
			'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6,
			'2 Timothy': 4, 'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5,
			'1 Peter': 5, '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1,
			'Jude': 1, 'Revelation': 22
		};
		
		// DOM elements
		const statusDot = document.getElementById('statusDot');
		const statusText = document.getElementById('statusText');
		const tabs = document.querySelectorAll('.tab');
		const panels = document.querySelectorAll('.panel');
		const songSearch = document.getElementById('songSearch');
		const songsList = document.getElementById('songsList');
		const songSlides = document.getElementById('songSlides');
		const bookSelect = document.getElementById('bookSelect');
		const chapterSelect = document.getElementById('chapterSelect');
		const versionSelect = document.getElementById('versionSelect');
		const versesList = document.getElementById('versesList');
		const scheduleList = document.getElementById('scheduleList');
		const nowPlayingTitle = document.getElementById('nowPlayingTitle');
		const nowPlayingSlide = document.getElementById('nowPlayingSlide');
		const prevBtn = document.getElementById('prevBtn');
		const nextBtn = document.getElementById('nextBtn');
		const blankBtn = document.getElementById('blankBtn');
		
		// Connect WebSocket
		function connect() {
			const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
			ws = new WebSocket(protocol + '//' + location.host + '/ws');
			
			ws.onopen = () => {
				statusDot.classList.add('connected');
				statusText.textContent = 'Connected';
				clearTimeout(reconnectTimer);
				
				// Request initial data
				ws.send(JSON.stringify({ type: 'get-songs' }));
				ws.send(JSON.stringify({ type: 'get-schedule' }));
			};
			
			ws.onclose = () => {
				statusDot.classList.remove('connected');
				statusText.textContent = 'Disconnected';
				reconnectTimer = setTimeout(connect, 2000);
			};
			
			ws.onerror = () => {
				statusDot.classList.remove('connected');
				statusText.textContent = 'Error';
			};
			
			ws.onmessage = (event) => {
				const msg = JSON.parse(event.data);
				handleMessage(msg);
			};
		}
		
		// Handle WebSocket messages
		function handleMessage(msg) {
			switch (msg.type) {
				case 'state':
					state = msg.state;
					updateNowPlaying();
					break;
					
				case 'songs':
					songs = msg.songs;
					renderSongsList();
					break;
					
				case 'song-lyrics':
					songLyrics[msg.songId] = msg.lyrics;
					if (selectedSong && selectedSong.id === msg.songId) {
						renderSongSlides(msg.lyrics);
					}
					break;
					
				case 'scripture':
					renderVerses(msg.data);
					break;
					
				case 'schedule':
					renderSchedule(msg.items);
					break;
					
				case 'error':
					alert('Error: ' + msg.message);
					break;
			}
		}
		
		// Update now playing
		function updateNowPlaying() {
			if (!state || !state.currentItem || state.currentItem.type === 'none') {
				nowPlayingTitle.textContent = 'Nothing live';
				nowPlayingSlide.textContent = '-';
			} else {
				nowPlayingTitle.textContent = state.currentItem.title;
				nowPlayingSlide.textContent = 'Slide ' + (state.currentItem.slideIndex + 1) + ' of ' + state.currentItem.totalSlides;
			}
		}
		
		// Render songs list
		function renderSongsList() {
			const query = songSearch.value.toLowerCase();
			const filtered = query 
				? songs.filter(s => s.title.toLowerCase().includes(query) || s.author.toLowerCase().includes(query))
				: songs;
			
			if (filtered.length === 0) {
				songsList.innerHTML = '<div class="empty-state"><p>No songs found</p></div>';
				return;
			}
			
			songsList.innerHTML = filtered.map(song => 
				'<div class="list-item' + (selectedSong && selectedSong.id === song.id ? ' active' : '') + '" data-song-id="' + song.id + '">' +
					'<div class="list-item-icon">🎵</div>' +
					'<div class="list-item-content">' +
						'<div class="list-item-title">' + escapeHtml(song.title) + '</div>' +
						'<div class="list-item-subtitle">' + escapeHtml(song.author || 'Unknown') + '</div>' +
					'</div>' +
				'</div>'
			).join('');
		}
		
		// Render song slides
		function renderSongSlides(lyrics) {
			songSlides.style.display = 'block';
			songSlides.innerHTML = '<h3 class="mb-16" style="color: var(--text-muted); font-size: 12px; text-transform: uppercase;">Slides</h3>' +
				lyrics.map((lyric, idx) =>
					'<div class="slide" data-slide-index="' + idx + '">' +
						'<div class="slide-label">' + escapeHtml(lyric.label) + '</div>' +
						'<div class="slide-text">' + escapeHtml(Array.isArray(lyric.text) ? lyric.text.join('\\n') : lyric.text) + '</div>' +
					'</div>'
				).join('');
		}
		
		// Render verses
		function renderVerses(data) {
			if (!data || !data.verses || data.verses.length === 0) {
				versesList.innerHTML = '<div class="empty-state"><p>No verses found</p></div>';
				return;
			}
			
			versesList.innerHTML = data.verses.map(v =>
				'<div class="list-item" data-verse="' + v.verse + '" data-book="' + data.book + '" data-chapter="' + data.chapter + '" data-version="' + data.version + '">' +
					'<div class="list-item-icon" style="font-size: 14px; font-weight: 600;">' + v.verse + '</div>' +
					'<div class="list-item-content">' +
						'<div class="list-item-title" style="white-space: normal;">' + escapeHtml(v.text) + '</div>' +
					'</div>' +
				'</div>'
			).join('');
		}
		
		// Render schedule
		function renderSchedule(items) {
			if (!items || items.length === 0) {
				scheduleList.innerHTML = '<div class="empty-state"><p>Schedule is empty</p></div>';
				return;
			}
			
			scheduleList.innerHTML = items.map((item, idx) =>
				'<div class="list-item" data-schedule-idx="' + idx + '" data-type="' + item.type + '">' +
					'<div class="list-item-icon">' + getTypeIcon(item.type) + '</div>' +
					'<div class="list-item-content">' +
						'<div class="list-item-title">' + escapeHtml(item.title) + '</div>' +
						'<div class="list-item-subtitle">' + item.type + '</div>' +
					'</div>' +
				'</div>'
			).join('');
		}
		
		function getTypeIcon(type) {
			switch (type) {
				case 'song': return '🎵';
				case 'scripture': return '📖';
				case 'image': return '🖼️';
				case 'video': return '🎬';
				default: return '📄';
			}
		}
		
		function escapeHtml(text) {
			const div = document.createElement('div');
			div.textContent = text || '';
			return div.innerHTML;
		}
		
		// Initialize book select
		function initBookSelect() {
			bookSelect.innerHTML = '<option value="">Select Book</option>' +
				bibleBooks.map(b => '<option value="' + b + '">' + b + '</option>').join('');
		}
		
		// Event listeners
		tabs.forEach(tab => {
			tab.addEventListener('click', () => {
				tabs.forEach(t => t.classList.remove('active'));
				panels.forEach(p => p.classList.remove('active'));
				tab.classList.add('active');
				document.getElementById(tab.dataset.tab + 'Panel').classList.add('active');
			});
		});
		
		songSearch.addEventListener('input', () => {
			renderSongsList();
		});
		
		songsList.addEventListener('click', (e) => {
			const item = e.target.closest('.list-item');
			if (!item) return;
			
			const songId = parseInt(item.dataset.songId);
			selectedSong = songs.find(s => s.id === songId);
			renderSongsList();
			
			// Request lyrics if not cached
			if (!songLyrics[songId]) {
				ws.send(JSON.stringify({ type: 'get-song-lyrics', songId }));
			} else {
				renderSongSlides(songLyrics[songId]);
			}
		});
		
		songSlides.addEventListener('click', (e) => {
			const slide = e.target.closest('.slide');
			if (!slide || !selectedSong) return;
			
			const slideIndex = parseInt(slide.dataset.slideIndex);
			ws.send(JSON.stringify({
				type: 'go-live',
				item: {
					type: 'song',
					songId: selectedSong.id,
					slideIndex
				}
			}));
		});
		
		bookSelect.addEventListener('change', () => {
			const book = bookSelect.value;
			if (!book) {
				chapterSelect.innerHTML = '<option value="">Chapter</option>';
				return;
			}
			
			const chapters = chapterCounts[book] || 1;
			chapterSelect.innerHTML = '<option value="">Chapter</option>' +
				Array.from({ length: chapters }, (_, i) => '<option value="' + (i + 1) + '">' + (i + 1) + '</option>').join('');
		});
		
		chapterSelect.addEventListener('change', () => {
			const book = bookSelect.value;
			const chapter = parseInt(chapterSelect.value);
			const version = versionSelect.value;
			
			if (!book || !chapter) return;
			
			versesList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
			ws.send(JSON.stringify({
				type: 'get-scripture',
				book,
				chapter,
				version
			}));
		});
		
		versionSelect.addEventListener('change', () => {
			const book = bookSelect.value;
			const chapter = parseInt(chapterSelect.value);
			const version = versionSelect.value;
			
			if (!book || !chapter) return;
			
			ws.send(JSON.stringify({
				type: 'get-scripture',
				book,
				chapter,
				version
			}));
		});
		
		versesList.addEventListener('click', (e) => {
			const item = e.target.closest('.list-item');
			if (!item) return;
			
			ws.send(JSON.stringify({
				type: 'go-live',
				item: {
					type: 'scripture',
					book: item.dataset.book,
					chapter: parseInt(item.dataset.chapter),
					verse: item.dataset.verse,
					version: item.dataset.version
				}
			}));
		});
		
		prevBtn.addEventListener('click', () => {
			ws.send(JSON.stringify({ type: 'navigate', direction: 'prev' }));
		});
		
		nextBtn.addEventListener('click', () => {
			ws.send(JSON.stringify({ type: 'navigate', direction: 'next' }));
		});
		
		blankBtn.addEventListener('click', () => {
			ws.send(JSON.stringify({ type: 'go-blank' }));
		});
		
		// Initialize
		initBookSelect();
		connect();
	</script>
</body>
</html>`;
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
			broadcast({ type: "scripture", data: message.data });
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
