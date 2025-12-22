/**
 * Remote Control App - SolidJS
 * Main application component
 */

import { createSignal, createEffect, onMount, onCleanup, Show, For, JSX } from "solid-js";
import { createStore, produce } from "solid-js/store";

// Types
interface Song {
	id: number;
	title: string;
	author: string;
	themeId: number | null;
}

interface SongLyric {
	label: string;
	text: string[];
}

interface Translation {
	id: number;
	version: string;
	description: string;
}

interface Verse {
	verse: string;
	text: string;
}

interface ScriptureChapter {
	book: string;
	chapter: number;
	version: string;
	verses: Verse[];
}

interface ScheduleItem {
	type: "song" | "scripture" | "image" | "video";
	title: string;
	data: unknown;
}

interface AppState {
	isLive: boolean;
	currentItem: {
		type: "scripture" | "song" | "image" | "video" | "none";
		title: string;
		slideIndex: number;
		totalSlides: number;
	} | null;
	hideLive: boolean;
	showLogo: boolean;
}

interface PreviewItem {
	type: "song" | "scripture";
	title: string;
	content: string[];
	slideIndex: number;
}

// WebSocket connection
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

// Bible data
const bibleBooks = [
	"Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
	"Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
	"1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
	"Nehemiah", "Esther", "Job", "Psalms", "Proverbs",
	"Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
	"Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
	"Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
	"Zephaniah", "Haggai", "Zechariah", "Malachi",
	"Matthew", "Mark", "Luke", "John", "Acts",
	"Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
	"Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
	"2 Timothy", "Titus", "Philemon", "Hebrews", "James",
	"1 Peter", "2 Peter", "1 John", "2 John", "3 John",
	"Jude", "Revelation"
];

const chapterCounts: Record<string, number> = {
	"Genesis": 50, "Exodus": 40, "Leviticus": 27, "Numbers": 36, "Deuteronomy": 34,
	"Joshua": 24, "Judges": 21, "Ruth": 4, "1 Samuel": 31, "2 Samuel": 24,
	"1 Kings": 22, "2 Kings": 25, "1 Chronicles": 29, "2 Chronicles": 36, "Ezra": 10,
	"Nehemiah": 13, "Esther": 10, "Job": 42, "Psalms": 150, "Proverbs": 31,
	"Ecclesiastes": 12, "Song of Solomon": 8, "Isaiah": 66, "Jeremiah": 52, "Lamentations": 5,
	"Ezekiel": 48, "Daniel": 12, "Hosea": 14, "Joel": 3, "Amos": 9,
	"Obadiah": 1, "Jonah": 4, "Micah": 7, "Nahum": 3, "Habakkuk": 3,
	"Zephaniah": 3, "Haggai": 2, "Zechariah": 14, "Malachi": 4,
	"Matthew": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28,
	"Romans": 16, "1 Corinthians": 16, "2 Corinthians": 13, "Galatians": 6, "Ephesians": 6,
	"Philippians": 4, "Colossians": 4, "1 Thessalonians": 5, "2 Thessalonians": 3, "1 Timothy": 6,
	"2 Timothy": 4, "Titus": 3, "Philemon": 1, "Hebrews": 13, "James": 5,
	"1 Peter": 5, "2 Peter": 3, "1 John": 5, "2 John": 1, "3 John": 1,
	"Jude": 1, "Revelation": 22
};

export default function App() {
	// Connection state
	const [connected, setConnected] = createSignal(false);
	const [activeTab, setActiveTab] = createSignal<"songs" | "scripture" | "schedule">("songs");
	
	// Songs state
	const [songs, setSongs] = createSignal<Song[]>([]);
	const [songSearch, setSongSearch] = createSignal("");
	const [selectedSong, setSelectedSong] = createSignal<Song | null>(null);
	const [songLyrics, setSongLyrics] = createStore<Record<number, SongLyric[]>>({});
	
	// Scripture state
	const [translations, setTranslations] = createSignal<Translation[]>([]);
	const [selectedBook, setSelectedBook] = createSignal("");
	const [selectedChapter, setSelectedChapter] = createSignal<number>(0);
	const [selectedVersion, setSelectedVersion] = createSignal("NKJV");
	const [verses, setVerses] = createSignal<Verse[]>([]);
	const [selectedVerses, setSelectedVerses] = createSignal<Set<string>>(new Set());
	
	// Schedule state
	const [schedule, setSchedule] = createSignal<ScheduleItem[]>([]);
	
	// Preview state
	const [preview, setPreview] = createSignal<PreviewItem | null>(null);
	const [showPreview, setShowPreview] = createSignal(false);
	
	// App state from server
	const [appState, setAppState] = createSignal<AppState | null>(null);

	// Filtered songs
	const filteredSongs = () => {
		const query = songSearch().toLowerCase().trim();
		if (!query) return songs();
		return songs().filter(s => 
			s.title?.toLowerCase().includes(query) || 
			s.author?.toLowerCase().includes(query)
		);
	};

	// Connect to WebSocket
	const connect = () => {
		const protocol = location.protocol === "https:" ? "wss:" : "ws:";
		ws = new WebSocket(`${protocol}//${location.host}/ws`);

		ws.onopen = () => {
			setConnected(true);
			if (reconnectTimer) {
				clearTimeout(reconnectTimer);
				reconnectTimer = null;
			}
			// Request initial data
			send({ type: "get-songs" });
			send({ type: "get-schedule" });
			send({ type: "get-translations" });
		};

		ws.onclose = () => {
			setConnected(false);
			reconnectTimer = setTimeout(connect, 2000);
		};

		ws.onerror = () => {
			setConnected(false);
		};

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			handleMessage(msg);
		};
	};

	// Send message
	const send = (msg: object) => {
		if (ws?.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify(msg));
		}
	};

	// Handle incoming messages
	const handleMessage = (msg: any) => {
		console.log("Received:", msg);
		switch (msg.type) {
			case "state":
				setAppState(msg.state);
				break;
			case "songs":
				setSongs(msg.songs || []);
				break;
			case "song-lyrics":
				setSongLyrics(produce((s) => {
					s[msg.songId] = msg.lyrics;
				}));
				break;
			case "scripture":
				setVerses(msg.data?.verses || []);
				break;
			case "translations":
				setTranslations(msg.translations || []);
				if (msg.translations?.length > 0 && !selectedVersion()) {
					setSelectedVersion(msg.translations[0].version);
				}
				break;
			case "schedule":
				setSchedule(msg.items || []);
				break;
			case "go-live-success":
				// Feedback for successful go-live
				break;
			case "error":
				alert("Error: " + msg.message);
				break;
		}
	};

	// Actions
	const selectSong = (song: Song) => {
		setSelectedSong(song);
		if (!songLyrics[song.id]) {
			send({ type: "get-song-lyrics", songId: song.id });
		}
	};

	const goLiveSong = (slideIndex: number) => {
		const song = selectedSong();
		if (!song) return;
		
		send({
			type: "go-live",
			item: {
				type: "song",
				songId: song.id,
				title: song.title,
				slideIndex
			}
		});
	};

	const goLiveScripture = (verse: Verse) => {
		send({
			type: "go-live",
			item: {
				type: "scripture",
				book: selectedBook(),
				chapter: selectedChapter(),
				verse: verse.verse,
				version: selectedVersion(),
				title: `${selectedBook()} ${selectedChapter()}:${verse.verse}`
			}
		});
	};

	const addSongToSchedule = () => {
		const song = selectedSong();
		if (!song) return;
		
		send({
			type: "add-to-schedule",
			item: {
				type: "song",
				songId: song.id,
				title: song.title
			}
		});
	};

	const addScriptureToSchedule = () => {
		const selected = Array.from(selectedVerses());
		if (selected.length === 0) return;
		
		send({
			type: "add-to-schedule",
			item: {
				type: "scripture",
				book: selectedBook(),
				chapter: selectedChapter(),
				verses: selected,
				version: selectedVersion(),
				title: `${selectedBook()} ${selectedChapter()}:${selected.join(", ")}`
			}
		});
	};

	const toggleVerseSelection = (verse: string) => {
		setSelectedVerses(prev => {
			const newSet = new Set(prev);
			if (newSet.has(verse)) {
				newSet.delete(verse);
			} else {
				newSet.add(verse);
			}
			return newSet;
		});
	};

	const navigate = (direction: "next" | "prev") => {
		send({ type: "navigate", direction });
	};

	const goBlank = () => {
		send({ type: "go-blank" });
	};

	const fetchScripture = () => {
		const book = selectedBook();
		const chapter = selectedChapter();
		const version = selectedVersion();
		
		if (!book || !chapter) return;
		
		setVerses([]);
		setSelectedVerses(new Set());
		send({
			type: "get-scripture",
			book,
			chapter,
			version
		});
	};

	// Update preview for song
	const previewSongSlide = (lyric: SongLyric, index: number) => {
		const song = selectedSong();
		if (!song) return;
		
		setPreview({
			type: "song",
			title: song.title,
			content: lyric.text,
			slideIndex: index
		});
		setShowPreview(true);
	};

	// Update preview for scripture
	const previewScriptureVerse = (verse: Verse) => {
		setPreview({
			type: "scripture",
			title: `${selectedBook()} ${selectedChapter()}:${verse.verse} (${selectedVersion()})`,
			content: [verse.text],
			slideIndex: 0
		});
		setShowPreview(true);
	};

	// Effects
	createEffect(() => {
		const book = selectedBook();
		const chapter = selectedChapter();
		if (book && chapter) {
			fetchScripture();
		}
	});

	onMount(() => {
		connect();
	});

	onCleanup(() => {
		if (ws) ws.close();
		if (reconnectTimer) clearTimeout(reconnectTimer);
	});

	return (
		<div class="app">
			{/* Header */}
			<header class="header">
				<h1>📖 Crater Remote</h1>
				<div class="status">
					<div class={`status-dot ${connected() ? "connected" : ""}`} />
					<span>{connected() ? "Connected" : "Connecting..."}</span>
				</div>
			</header>

			{/* Tabs */}
			<nav class="tabs">
				<button 
					class={`tab ${activeTab() === "songs" ? "active" : ""}`}
					onClick={() => setActiveTab("songs")}
				>
					Songs
				</button>
				<button 
					class={`tab ${activeTab() === "scripture" ? "active" : ""}`}
					onClick={() => setActiveTab("scripture")}
				>
					Scripture
				</button>
				<button 
					class={`tab ${activeTab() === "schedule" ? "active" : ""}`}
					onClick={() => setActiveTab("schedule")}
				>
					Schedule
				</button>
			</nav>

			{/* Content */}
			<main class="content">
				{/* Songs Panel */}
				<Show when={activeTab() === "songs"}>
					<div class="panel">
						<div class="search-box">
							<input
								type="search"
								placeholder="Search songs..."
								value={songSearch()}
								onInput={(e) => setSongSearch(e.currentTarget.value)}
							/>
						</div>
						
						<div class="list">
							<For each={filteredSongs()} fallback={<div class="empty-state">No songs found</div>}>
								{(song) => (
									<div 
										class={`list-item ${selectedSong()?.id === song.id ? "active" : ""}`}
										onClick={() => selectSong(song)}
									>
										<div class="list-item-icon">🎵</div>
										<div class="list-item-content">
											<div class="list-item-title">{song.title || "Untitled"}</div>
											<div class="list-item-subtitle">{song.author || "Unknown"}</div>
										</div>
									</div>
								)}
							</For>
						</div>

						{/* Song Slides */}
						<Show when={selectedSong() && songLyrics[selectedSong()!.id]}>
							<div class="slides-container">
								<div class="slides-header">
									<h3>Slides - {selectedSong()!.title}</h3>
									<button class="btn btn-secondary" onClick={addSongToSchedule}>
										+ Add to Schedule
									</button>
								</div>
								<For each={songLyrics[selectedSong()!.id]}>
									{(lyric, idx) => (
										<div 
											class="slide"
											onClick={() => goLiveSong(idx())}
											onDblClick={() => previewSongSlide(lyric, idx())}
										>
											<div class="slide-label">{lyric.label}</div>
											<div class="slide-text">{lyric.text.join("\n")}</div>
											<div class="slide-actions">
												<button 
													class="btn btn-small btn-primary"
													onClick={(e) => { e.stopPropagation(); goLiveSong(idx()); }}
												>
													Go Live
												</button>
												<button 
													class="btn btn-small"
													onClick={(e) => { e.stopPropagation(); previewSongSlide(lyric, idx()); }}
												>
													Preview
												</button>
											</div>
										</div>
									)}
								</For>
							</div>
						</Show>
					</div>
				</Show>

				{/* Scripture Panel */}
				<Show when={activeTab() === "scripture"}>
					<div class="panel">
						<div class="scripture-selector">
							<select 
								value={selectedBook()}
								onChange={(e) => {
									setSelectedBook(e.currentTarget.value);
									setSelectedChapter(0);
									setVerses([]);
								}}
							>
								<option value="">Select Book</option>
								<For each={bibleBooks}>
									{(book) => <option value={book}>{book}</option>}
								</For>
							</select>
							
							<select
								value={selectedChapter()}
								onChange={(e) => setSelectedChapter(parseInt(e.currentTarget.value) || 0)}
								disabled={!selectedBook()}
							>
								<option value={0}>Chapter</option>
								<Show when={selectedBook()}>
									<For each={Array.from({ length: chapterCounts[selectedBook()] || 0 }, (_, i) => i + 1)}>
										{(ch) => <option value={ch}>{ch}</option>}
									</For>
								</Show>
							</select>
							
							<select
								value={selectedVersion()}
								onChange={(e) => {
									setSelectedVersion(e.currentTarget.value);
									if (selectedBook() && selectedChapter()) {
										fetchScripture();
									}
								}}
							>
								<Show when={translations().length > 0} fallback={
									<>
										<option value="NKJV">NKJV</option>
										<option value="NIV">NIV</option>
										<option value="NLT">NLT</option>
									</>
								}>
									<For each={translations()}>
										{(t) => <option value={t.version}>{t.version}</option>}
									</For>
								</Show>
							</select>
						</div>

						<Show when={selectedVerses().size > 0}>
							<div class="selection-bar">
								<span>{selectedVerses().size} verse(s) selected</span>
								<button class="btn btn-secondary" onClick={addScriptureToSchedule}>
									+ Add to Schedule
								</button>
								<button class="btn btn-small" onClick={() => setSelectedVerses(new Set())}>
									Clear
								</button>
							</div>
						</Show>

						<div class="list">
							<Show when={verses().length > 0} fallback={
								<div class="empty-state">
									{selectedBook() && selectedChapter() ? "Loading..." : "Select a book and chapter"}
								</div>
							}>
								<For each={verses()}>
									{(verse) => (
										<div 
											class={`list-item verse-item ${selectedVerses().has(verse.verse) ? "selected" : ""}`}
											onClick={() => toggleVerseSelection(verse.verse)}
											onDblClick={() => goLiveScripture(verse)}
										>
											<div 
												class="list-item-checkbox"
												onClick={(e) => { e.stopPropagation(); toggleVerseSelection(verse.verse); }}
											>
												<input 
													type="checkbox" 
													checked={selectedVerses().has(verse.verse)}
													onChange={() => toggleVerseSelection(verse.verse)}
												/>
											</div>
											<div class="list-item-icon verse-number">{verse.verse}</div>
											<div class="list-item-content">
												<div class="list-item-title verse-text">{verse.text}</div>
											</div>
											<div class="list-item-actions">
												<button 
													class="btn btn-small btn-primary"
													onClick={(e) => { e.stopPropagation(); goLiveScripture(verse); }}
												>
													Go Live
												</button>
												<button 
													class="btn btn-small"
													onClick={(e) => { e.stopPropagation(); previewScriptureVerse(verse); }}
												>
													Preview
												</button>
											</div>
										</div>
									)}
								</For>
							</Show>
						</div>
					</div>
				</Show>

				{/* Schedule Panel */}
				<Show when={activeTab() === "schedule"}>
					<div class="panel">
						<div class="list">
							<Show when={schedule().length > 0} fallback={
								<div class="empty-state">Schedule is empty</div>
							}>
								<For each={schedule()}>
									{(item, idx) => (
										<div class="list-item">
											<div class="list-item-icon">
												{item.type === "song" ? "🎵" : item.type === "scripture" ? "📖" : "📄"}
											</div>
											<div class="list-item-content">
												<div class="list-item-title">{item.title}</div>
												<div class="list-item-subtitle">{item.type}</div>
											</div>
										</div>
									)}
								</For>
							</Show>
						</div>
					</div>
				</Show>
			</main>

			{/* Preview Modal */}
			<Show when={showPreview() && preview()}>
				<div class="preview-overlay" onClick={() => setShowPreview(false)}>
					<div class="preview-modal" onClick={(e) => e.stopPropagation()}>
						<div class="preview-header">
							<h3>{preview()!.title}</h3>
							<button class="btn-close" onClick={() => setShowPreview(false)}>×</button>
						</div>
						<div class="preview-content">
							<div class="preview-display">
								<For each={preview()!.content}>
									{(line) => <p>{line}</p>}
								</For>
							</div>
						</div>
						<div class="preview-actions">
							<button class="btn btn-primary" onClick={() => {
								const p = preview()!;
								if (p.type === "song" && selectedSong()) {
									goLiveSong(p.slideIndex);
								}
								setShowPreview(false);
							}}>
								Go Live
							</button>
							<button class="btn btn-secondary" onClick={() => setShowPreview(false)}>
								Close
							</button>
						</div>
					</div>
				</div>
			</Show>

			{/* Live Controls */}
			<footer class="live-controls">
				<div class="now-playing">
					<div class="now-playing-info">
						<div class="now-playing-title">
							{appState()?.currentItem?.title || "Nothing live"}
						</div>
						<div class="now-playing-slide">
							{appState()?.currentItem ? 
								`Slide ${(appState()!.currentItem!.slideIndex || 0) + 1} of ${appState()!.currentItem!.totalSlides || 1}` : 
								"-"
							}
						</div>
					</div>
				</div>
				<div class="nav-buttons">
					<button class="nav-btn" onClick={() => navigate("prev")}>← Prev</button>
					<button class="nav-btn danger" onClick={goBlank}>Blank</button>
					<button class="nav-btn" onClick={() => navigate("next")}>Next →</button>
				</div>
			</footer>
		</div>
	);
}
