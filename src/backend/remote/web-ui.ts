/**
 * Remote Control Web UI HTML Generator
 * Uses vanilla JS for simplicity in child process
 */

export function getWebUI(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<title>Crater Remote</title>
	<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>">
	<style>
		* { box-sizing: border-box; margin: 0; padding: 0; }
		:root {
			--bg: #0a0a0a; --bg-card: #18181b; --bg-hover: #27272a;
			--border: #3f3f46; --text: #fafafa; --text-muted: #a1a1aa;
			--primary: #3b82f6; --primary-hover: #2563eb;
			--success: #22c55e; --danger: #ef4444;
		}
		body {
			font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
			background: var(--bg); color: var(--text);
			min-height: 100vh; padding-bottom: env(safe-area-inset-bottom);
		}
		.header {
			position: sticky; top: 0; z-index: 100;
			background: var(--bg-card); border-bottom: 1px solid var(--border);
			padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;
		}
		.header h1 { font-size: 18px; font-weight: 600; }
		.status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-muted); }
		.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--danger); transition: 0.2s; }
		.status-dot.connected { background: var(--success); }
		.tabs {
			display: flex; background: var(--bg-card); border-bottom: 1px solid var(--border);
			overflow-x: auto; -webkit-overflow-scrolling: touch;
		}
		.tab {
			flex: 1; min-width: 80px; padding: 12px 16px; background: none;
			border: none; color: var(--text-muted); font-size: 14px; font-weight: 500;
			cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap;
		}
		.tab:hover { color: var(--text); }
		.tab.active { color: var(--primary); border-bottom-color: var(--primary); }
		.content { padding: 16px; padding-bottom: 160px; }
		.panel { display: none; animation: fadeIn 0.2s ease; }
		.panel.active { display: block; }
		@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
		.search-box { margin-bottom: 16px; }
		.search-box input {
			width: 100%; padding: 12px 16px; background: var(--bg-card);
			border: 1px solid var(--border); border-radius: 8px;
			color: var(--text); font-size: 16px; outline: none;
		}
		.search-box input:focus { border-color: var(--primary); }
		.search-box input::placeholder { color: var(--text-muted); }
		.list { display: flex; flex-direction: column; gap: 8px; }
		.list-item {
			display: flex; align-items: flex-start; gap: 12px; padding: 12px;
			background: var(--bg-card); border: 1px solid var(--border);
			border-radius: 8px; cursor: pointer; transition: 0.15s;
		}
		.list-item:hover { background: var(--bg-hover); }
		.list-item.active { border-color: var(--primary); background: rgba(59, 130, 246, 0.1); }
		.list-item.selected { border-color: var(--success); background: rgba(34, 197, 94, 0.1); }
		.list-item-checkbox { display: flex; align-items: center; padding-top: 2px; }
		.list-item-checkbox input { width: 18px; height: 18px; accent-color: var(--primary); }
		.list-item-icon {
			width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
			background: var(--bg); border-radius: 8px; font-size: 18px; flex-shrink: 0;
		}
		.list-item-icon.verse-num { font-size: 12px; font-weight: 600; color: var(--primary); }
		.list-item-content { flex: 1; min-width: 0; }
		.list-item-title { font-size: 14px; font-weight: 500; }
		.list-item-title.verse-text { white-space: normal; line-height: 1.5; }
		.list-item-subtitle { font-size: 12px; color: var(--text-muted); }
		.list-item-actions { display: flex; gap: 6px; flex-shrink: 0; margin-left: auto; }
		.slides-container { margin-top: 24px; border-top: 1px solid var(--border); padding-top: 16px; }
		.slides-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; gap: 12px; flex-wrap: wrap; }
		.slides-header h3 { font-size: 14px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
		.slide {
			padding: 16px; background: var(--bg-card); border: 1px solid var(--border);
			border-radius: 8px; margin-bottom: 8px; cursor: pointer; transition: 0.15s;
		}
		.slide:hover { background: var(--bg-hover); }
		.slide-label { font-size: 11px; font-weight: 600; color: var(--primary); text-transform: uppercase; margin-bottom: 8px; }
		.slide-text { font-size: 14px; line-height: 1.5; white-space: pre-wrap; color: var(--text-muted); }
		.slide-actions { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); }
		.scripture-selector { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
		.scripture-selector select {
			padding: 12px; background: var(--bg-card); border: 1px solid var(--border);
			border-radius: 8px; color: var(--text); font-size: 14px; outline: none;
		}
		.scripture-selector select:focus { border-color: var(--primary); }
		.scripture-selector select:disabled { opacity: 0.5; }
		.selection-bar {
			display: flex; align-items: center; gap: 12px; padding: 12px; flex-wrap: wrap;
			background: rgba(34, 197, 94, 0.1); border: 1px solid var(--success);
			border-radius: 8px; margin-bottom: 16px;
		}
		.selection-bar span { flex: 1; font-size: 14px; color: var(--success); min-width: 120px; }
		.btn {
			padding: 8px 14px; background: var(--bg); border: 1px solid var(--border);
			border-radius: 6px; color: var(--text); font-size: 13px; font-weight: 500;
			cursor: pointer; transition: 0.15s; white-space: nowrap;
		}
		.btn:hover { background: var(--bg-hover); }
		.btn-sm { padding: 6px 10px; font-size: 12px; }
		.btn-primary { background: var(--primary); border-color: var(--primary); }
		.btn-primary:hover { background: var(--primary-hover); }
		.btn-secondary { background: transparent; border-color: var(--primary); color: var(--primary); }
		.btn-secondary:hover { background: rgba(59, 130, 246, 0.1); }
		.btn-danger { background: var(--danger); border-color: var(--danger); }
		.preview-overlay {
			position: fixed; top: 0; left: 0; right: 0; bottom: 0;
			background: rgba(0, 0, 0, 0.85); display: none; align-items: center;
			justify-content: center; z-index: 200; padding: 20px;
		}
		.preview-overlay.active { display: flex; }
		.preview-modal {
			background: var(--bg-card); border: 1px solid var(--border);
			border-radius: 12px; width: 100%; max-width: 500px; max-height: 80vh;
			display: flex; flex-direction: column; overflow: hidden;
		}
		.preview-header {
			display: flex; align-items: center; justify-content: space-between;
			padding: 16px; border-bottom: 1px solid var(--border);
		}
		.preview-header h3 { font-size: 16px; font-weight: 600; flex: 1; }
		.preview-close {
			width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
			background: transparent; border: none; color: var(--text-muted);
			font-size: 24px; cursor: pointer; border-radius: 4px;
		}
		.preview-close:hover { background: var(--bg-hover); color: var(--text); }
		.preview-content { flex: 1; padding: 16px; overflow-y: auto; }
		.preview-display {
			aspect-ratio: 16 / 9; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
			border-radius: 8px; display: flex; flex-direction: column;
			align-items: center; justify-content: center; padding: 24px; text-align: center;
		}
		.preview-display p {
			font-size: 18px; line-height: 1.6; color: white;
			text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); margin: 4px 0;
		}
		.preview-actions {
			display: flex; gap: 8px; padding: 16px; border-top: 1px solid var(--border); justify-content: flex-end;
		}
		.live-controls {
			position: fixed; bottom: 0; left: 0; right: 0;
			background: var(--bg-card); border-top: 1px solid var(--border);
			padding: 12px 16px; padding-bottom: calc(12px + env(safe-area-inset-bottom));
			display: flex; flex-direction: column; gap: 12px; z-index: 100;
		}
		.now-playing { display: flex; align-items: center; gap: 12px; }
		.now-playing-info { flex: 1; min-width: 0; }
		.now-playing-title { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
		.now-playing-slide { font-size: 12px; color: var(--text-muted); }
		.nav-buttons { display: flex; gap: 8px; }
		.nav-btn {
			flex: 1; padding: 14px; background: var(--bg); border: 1px solid var(--border);
			border-radius: 8px; color: var(--text); font-size: 16px; font-weight: 500;
			cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.15s;
		}
		.nav-btn:hover { background: var(--bg-hover); }
		.nav-btn.danger { background: var(--danger); border-color: var(--danger); }
		.empty-state { text-align: center; padding: 40px 20px; color: var(--text-muted); }
		.loading { display: flex; align-items: center; justify-content: center; padding: 40px; }
		.spinner {
			width: 32px; height: 32px; border: 3px solid var(--border);
			border-top-color: var(--primary); border-radius: 50%;
			animation: spin 0.8s linear infinite;
		}
		@keyframes spin { to { transform: rotate(360deg); } }
		@media (max-width: 400px) {
			.scripture-selector { grid-template-columns: 1fr; }
			.slides-header { flex-direction: column; align-items: stretch; }
		}
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
	
	<main class="content">
		<div class="panel active" id="songsPanel">
			<div class="search-box">
				<input type="search" id="songSearch" placeholder="Search songs...">
			</div>
			<div class="list" id="songsList">
				<div class="loading"><div class="spinner"></div></div>
			</div>
			<div class="slides-container" id="songSlides" style="display: none;"></div>
		</div>
		
		<div class="panel" id="scripturePanel">
			<div class="scripture-selector">
				<select id="bookSelect"><option value="">Select Book</option></select>
				<select id="chapterSelect"><option value="">Chapter</option></select>
				<select id="versionSelect"><option value="NKJV">NKJV</option></select>
			</div>
			<div id="selectionBar" class="selection-bar" style="display: none;">
				<span id="selectionCount">0 verse(s) selected</span>
				<button class="btn btn-secondary btn-sm" id="addScriptureBtn">+ Add to Schedule</button>
				<button class="btn btn-sm" id="clearSelectionBtn">Clear</button>
			</div>
			<div class="list" id="versesList">
				<div class="empty-state"><p>Select a book and chapter</p></div>
			</div>
		</div>
		
		<div class="panel" id="schedulePanel">
			<div class="list" id="scheduleList">
				<div class="loading"><div class="spinner"></div></div>
			</div>
		</div>
	</main>
	
	<div class="preview-overlay" id="previewOverlay">
		<div class="preview-modal">
			<div class="preview-header">
				<h3 id="previewTitle">Preview</h3>
				<button class="preview-close" id="previewClose">×</button>
			</div>
			<div class="preview-content">
				<div class="preview-display" id="previewDisplay"></div>
			</div>
			<div class="preview-actions">
				<button class="btn btn-primary" id="previewGoLive">Go Live</button>
				<button class="btn" id="previewCloseBtn">Close</button>
			</div>
		</div>
	</div>
	
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
	(function() {
		// State
		let ws = null;
		let reconnectTimer = null;
		let state = null;
		let songs = [];
		let selectedSong = null;
		let songLyrics = {};
		let selectedVerses = new Set();
		let currentPreview = null;
		
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
		const $ = id => document.getElementById(id);
		const statusDot = $('statusDot');
		const statusText = $('statusText');
		const songSearch = $('songSearch');
		const songsList = $('songsList');
		const songSlides = $('songSlides');
		const bookSelect = $('bookSelect');
		const chapterSelect = $('chapterSelect');
		const versionSelect = $('versionSelect');
		const versesList = $('versesList');
		const selectionBar = $('selectionBar');
		const selectionCount = $('selectionCount');
		const scheduleList = $('scheduleList');
		const nowPlayingTitle = $('nowPlayingTitle');
		const nowPlayingSlide = $('nowPlayingSlide');
		const previewOverlay = $('previewOverlay');
		const previewTitle = $('previewTitle');
		const previewDisplay = $('previewDisplay');
		
		// Connect WebSocket
		function connect() {
			const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
			ws = new WebSocket(protocol + '//' + location.host + '/ws');
			
			ws.onopen = () => {
				statusDot.classList.add('connected');
				statusText.textContent = 'Connected';
				if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
				send({ type: 'get-songs' });
				send({ type: 'get-schedule' });
				send({ type: 'get-translations' });
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
			
			ws.onmessage = (e) => handleMessage(JSON.parse(e.data));
		}
		
		function send(msg) {
			if (ws && ws.readyState === WebSocket.OPEN) {
				ws.send(JSON.stringify(msg));
			}
		}
		
		function handleMessage(msg) {
			console.log('Received:', msg);
			switch (msg.type) {
				case 'state':
					state = msg.state;
					updateNowPlaying();
					break;
				case 'songs':
					songs = msg.songs || [];
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
				case 'translations':
					renderTranslations(msg.translations);
					break;
				case 'schedule':
					renderSchedule(msg.items);
					break;
				case 'error':
					alert('Error: ' + msg.message);
					break;
			}
		}
		
		function updateNowPlaying() {
			if (!state || !state.currentItem || state.currentItem.type === 'none') {
				nowPlayingTitle.textContent = 'Nothing live';
				nowPlayingSlide.textContent = '-';
			} else {
				nowPlayingTitle.textContent = state.currentItem.title || 'Live';
				nowPlayingSlide.textContent = 'Slide ' + ((state.currentItem.slideIndex || 0) + 1) + ' of ' + (state.currentItem.totalSlides || 1);
			}
		}
		
		function escapeHtml(text) {
			const div = document.createElement('div');
			div.textContent = text || '';
			return div.innerHTML;
		}
		
		// Songs
		function renderSongsList() {
			const query = songSearch.value.toLowerCase().trim();
			const filtered = query 
				? songs.filter(s => (s.title && s.title.toLowerCase().includes(query)) || (s.author && s.author.toLowerCase().includes(query)))
				: songs;
			
			if (filtered.length === 0) {
				songsList.innerHTML = '<div class="empty-state"><p>No songs found</p></div>';
				return;
			}
			
			songsList.innerHTML = filtered.map(song => 
				'<div class="list-item' + (selectedSong && selectedSong.id === song.id ? ' active' : '') + '" data-song-id="' + song.id + '">' +
					'<div class="list-item-icon">🎵</div>' +
					'<div class="list-item-content">' +
						'<div class="list-item-title">' + escapeHtml(song.title || 'Untitled') + '</div>' +
						'<div class="list-item-subtitle">' + escapeHtml(song.author || 'Unknown') + '</div>' +
					'</div>' +
				'</div>'
			).join('');
		}
		
		function renderSongSlides(lyrics) {
			if (!selectedSong) return;
			songSlides.style.display = 'block';
			songSlides.innerHTML = 
				'<div class="slides-header">' +
					'<h3>' + escapeHtml(selectedSong.title) + '</h3>' +
					'<button class="btn btn-secondary btn-sm" id="addSongBtn">+ Add to Schedule</button>' +
				'</div>' +
				lyrics.map((lyric, idx) =>
					'<div class="slide" data-slide-idx="' + idx + '">' +
						'<div class="slide-label">' + escapeHtml(lyric.label) + '</div>' +
						'<div class="slide-text">' + escapeHtml(Array.isArray(lyric.text) ? lyric.text.join('\\n') : lyric.text) + '</div>' +
						'<div class="slide-actions">' +
							'<button class="btn btn-sm" data-action="preview" data-idx="' + idx + '">Preview</button>' +
							'<button class="btn btn-sm btn-primary" data-action="live" data-idx="' + idx + '">Go Live</button>' +
						'</div>' +
					'</div>'
				).join('');
			
			$('addSongBtn').onclick = () => {
				send({
					type: 'add-to-schedule',
					item: { type: 'song', songId: selectedSong.id, title: selectedSong.title }
				});
			};
		}
		
		// Scripture
		function initBookSelect() {
			bookSelect.innerHTML = '<option value="">Select Book</option>' +
				bibleBooks.map(b => '<option value="' + b + '">' + b + '</option>').join('');
		}
		
		function renderTranslations(translations) {
			if (!translations || translations.length === 0) return;
			const current = versionSelect.value;
			versionSelect.innerHTML = translations.map(t => 
				'<option value="' + t.version + '">' + t.version + '</option>'
			).join('');
			if (translations.some(t => t.version === current)) {
				versionSelect.value = current;
			}
		}
		
		function renderVerses(data) {
			if (!data || !data.verses || data.verses.length === 0) {
				versesList.innerHTML = '<div class="empty-state"><p>No verses found</p></div>';
				return;
			}
			
			versesList.innerHTML = data.verses.map(v =>
				'<div class="list-item' + (selectedVerses.has(v.verse) ? ' selected' : '') + '" data-verse="' + v.verse + '" data-book="' + data.book + '" data-chapter="' + data.chapter + '" data-version="' + data.version + '">' +
					'<div class="list-item-checkbox"><input type="checkbox" ' + (selectedVerses.has(v.verse) ? 'checked' : '') + '></div>' +
					'<div class="list-item-icon verse-num">' + v.verse + '</div>' +
					'<div class="list-item-content">' +
						'<div class="list-item-title verse-text">' + escapeHtml(v.text) + '</div>' +
					'</div>' +
					'<div class="list-item-actions">' +
						'<button class="btn btn-sm" data-action="preview-verse">Preview</button>' +
						'<button class="btn btn-sm btn-primary" data-action="live-verse">Go Live</button>' +
					'</div>' +
				'</div>'
			).join('');
			
			updateSelectionBar();
		}
		
		function updateSelectionBar() {
			if (selectedVerses.size > 0) {
				selectionBar.style.display = 'flex';
				selectionCount.textContent = selectedVerses.size + ' verse(s) selected';
			} else {
				selectionBar.style.display = 'none';
			}
		}
		
		// Schedule
		function renderSchedule(items) {
			if (!items || items.length === 0) {
				scheduleList.innerHTML = '<div class="empty-state"><p>Schedule is empty</p></div>';
				return;
			}
			
			scheduleList.innerHTML = items.map((item, idx) =>
				'<div class="list-item" data-schedule-idx="' + idx + '">' +
					'<div class="list-item-icon">' + (item.type === 'song' ? '🎵' : item.type === 'scripture' ? '📖' : '📄') + '</div>' +
					'<div class="list-item-content">' +
						'<div class="list-item-title">' + escapeHtml(item.title) + '</div>' +
						'<div class="list-item-subtitle">' + item.type + '</div>' +
					'</div>' +
				'</div>'
			).join('');
		}
		
		// Preview
		function showPreview(title, content, onGoLive) {
			previewTitle.textContent = title;
			previewDisplay.innerHTML = content.map(line => '<p>' + escapeHtml(line) + '</p>').join('');
			currentPreview = { title, content, onGoLive };
			previewOverlay.classList.add('active');
		}
		
		function hidePreview() {
			previewOverlay.classList.remove('active');
			currentPreview = null;
		}
		
		// Event listeners
		document.querySelectorAll('.tab').forEach(tab => {
			tab.onclick = () => {
				document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
				document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
				tab.classList.add('active');
				$(tab.dataset.tab + 'Panel').classList.add('active');
			};
		});
		
		songSearch.oninput = renderSongsList;
		
		songsList.onclick = (e) => {
			const item = e.target.closest('.list-item');
			if (!item) return;
			const songId = parseInt(item.dataset.songId);
			selectedSong = songs.find(s => s.id === songId);
			renderSongsList();
			if (!songLyrics[songId]) {
				send({ type: 'get-song-lyrics', songId });
			} else {
				renderSongSlides(songLyrics[songId]);
			}
		};
		
		songSlides.onclick = (e) => {
			const btn = e.target.closest('button[data-action]');
			if (!btn || !selectedSong) return;
			const idx = parseInt(btn.dataset.idx);
			const lyrics = songLyrics[selectedSong.id];
			if (!lyrics) return;
			
			if (btn.dataset.action === 'preview') {
				const lyric = lyrics[idx];
				showPreview(
					selectedSong.title + ' - ' + lyric.label,
					Array.isArray(lyric.text) ? lyric.text : [lyric.text],
					() => send({ type: 'go-live', item: { type: 'song', songId: selectedSong.id, title: selectedSong.title, slideIndex: idx } })
				);
			} else if (btn.dataset.action === 'live') {
				send({ type: 'go-live', item: { type: 'song', songId: selectedSong.id, title: selectedSong.title, slideIndex: idx } });
			}
		};
		
		bookSelect.onchange = () => {
			const book = bookSelect.value;
			if (!book) {
				chapterSelect.innerHTML = '<option value="">Chapter</option>';
				return;
			}
			const chapters = chapterCounts[book] || 1;
			chapterSelect.innerHTML = '<option value="">Chapter</option>' +
				Array.from({ length: chapters }, (_, i) => '<option value="' + (i + 1) + '">' + (i + 1) + '</option>').join('');
			selectedVerses.clear();
			updateSelectionBar();
		};
		
		chapterSelect.onchange = () => {
			const book = bookSelect.value;
			const chapter = parseInt(chapterSelect.value);
			if (!book || !chapter) return;
			selectedVerses.clear();
			updateSelectionBar();
			versesList.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
			send({ type: 'get-scripture', book, chapter, version: versionSelect.value });
		};
		
		versionSelect.onchange = () => {
			const book = bookSelect.value;
			const chapter = parseInt(chapterSelect.value);
			if (!book || !chapter) return;
			send({ type: 'get-scripture', book, chapter, version: versionSelect.value });
		};
		
		versesList.onclick = (e) => {
			const item = e.target.closest('.list-item');
			if (!item) return;
			
			const btn = e.target.closest('button[data-action]');
			const checkbox = e.target.closest('.list-item-checkbox');
			
			if (btn) {
				const verse = item.dataset.verse;
				const book = item.dataset.book;
				const chapter = parseInt(item.dataset.chapter);
				const version = item.dataset.version;
				const text = item.querySelector('.verse-text').textContent;
				
				if (btn.dataset.action === 'preview-verse') {
					showPreview(
						book + ' ' + chapter + ':' + verse + ' (' + version + ')',
						[text],
						() => send({ type: 'go-live', item: { type: 'scripture', book, chapter, verse, version, title: book + ' ' + chapter + ':' + verse } })
					);
				} else if (btn.dataset.action === 'live-verse') {
					send({ type: 'go-live', item: { type: 'scripture', book, chapter, verse, version, title: book + ' ' + chapter + ':' + verse } });
				}
			} else {
				// Toggle selection
				const verse = item.dataset.verse;
				if (selectedVerses.has(verse)) {
					selectedVerses.delete(verse);
					item.classList.remove('selected');
					item.querySelector('input').checked = false;
				} else {
					selectedVerses.add(verse);
					item.classList.add('selected');
					item.querySelector('input').checked = true;
				}
				updateSelectionBar();
			}
		};
		
		$('addScriptureBtn').onclick = () => {
			const book = bookSelect.value;
			const chapter = parseInt(chapterSelect.value);
			const version = versionSelect.value;
			const verses = Array.from(selectedVerses);
			if (verses.length === 0) return;
			
			send({
				type: 'add-to-schedule',
				item: {
					type: 'scripture',
					book, chapter, verses, version,
					title: book + ' ' + chapter + ':' + verses.join(', ')
				}
			});
		};
		
		$('clearSelectionBtn').onclick = () => {
			selectedVerses.clear();
			document.querySelectorAll('.list-item.selected').forEach(item => {
				item.classList.remove('selected');
				item.querySelector('input').checked = false;
			});
			updateSelectionBar();
		};
		
		$('prevBtn').onclick = () => send({ type: 'navigate', direction: 'prev' });
		$('nextBtn').onclick = () => send({ type: 'navigate', direction: 'next' });
		$('blankBtn').onclick = () => send({ type: 'go-blank' });
		
		$('previewClose').onclick = hidePreview;
		$('previewCloseBtn').onclick = hidePreview;
		previewOverlay.onclick = (e) => { if (e.target === previewOverlay) hidePreview(); };
		$('previewGoLive').onclick = () => {
			if (currentPreview && currentPreview.onGoLive) {
				currentPreview.onGoLive();
				hidePreview();
			}
		};
		
		// Initialize
		initBookSelect();
		connect();
	})();
	</script>
</body>
</html>`;
}
