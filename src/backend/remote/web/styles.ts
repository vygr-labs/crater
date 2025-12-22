/**
 * Remote Control App Styles
 */

export const styles = `
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
	--warning: #f59e0b;
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
	transition: background 0.2s;
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
	-webkit-overflow-scrolling: touch;
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
	transition: all 0.2s;
}

.tab:hover {
	color: var(--text);
}

.tab.active {
	color: var(--primary);
	border-bottom-color: var(--primary);
}

/* Content */
.content {
	padding: 16px;
	padding-bottom: 160px;
	min-height: calc(100vh - 200px);
}

.panel {
	animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
	from { opacity: 0; transform: translateY(4px); }
	to { opacity: 1; transform: translateY(0); }
}

/* Search */
.search-box {
	position: relative;
	margin-bottom: 16px;
}

.search-box input {
	width: 100%;
	padding: 12px 16px;
	background: var(--bg-card);
	border: 1px solid var(--border);
	border-radius: 8px;
	color: var(--text);
	font-size: 16px;
	outline: none;
	transition: border-color 0.2s;
}

.search-box input:focus {
	border-color: var(--primary);
}

.search-box input::placeholder {
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
	transition: all 0.15s;
}

.list-item:hover, .list-item:active {
	background: var(--bg-hover);
}

.list-item.active {
	border-color: var(--primary);
	background: rgba(59, 130, 246, 0.1);
}

.list-item.selected {
	border-color: var(--success);
	background: rgba(34, 197, 94, 0.1);
}

.list-item-checkbox {
	display: flex;
	align-items: center;
}

.list-item-checkbox input {
	width: 18px;
	height: 18px;
	accent-color: var(--primary);
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
	flex-shrink: 0;
}

.list-item-icon.verse-number {
	font-size: 14px;
	font-weight: 600;
	color: var(--primary);
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

.list-item-title.verse-text {
	white-space: normal;
	line-height: 1.5;
}

.list-item-subtitle {
	font-size: 12px;
	color: var(--text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.list-item-actions {
	display: flex;
	gap: 4px;
	flex-shrink: 0;
}

.verse-item {
	flex-wrap: wrap;
}

.verse-item .list-item-actions {
	width: 100%;
	margin-top: 8px;
	padding-top: 8px;
	border-top: 1px solid var(--border);
	justify-content: flex-end;
}

/* Selection bar */
.selection-bar {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px;
	background: rgba(59, 130, 246, 0.1);
	border: 1px solid var(--primary);
	border-radius: 8px;
	margin-bottom: 16px;
}

.selection-bar span {
	flex: 1;
	font-size: 14px;
	color: var(--primary);
}

/* Slides */
.slides-container {
	margin-top: 24px;
	border-top: 1px solid var(--border);
	padding-top: 16px;
}

.slides-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16px;
}

.slides-header h3 {
	font-size: 14px;
	font-weight: 600;
	color: var(--text-muted);
	text-transform: uppercase;
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
	color: var(--text-muted);
}

.slide-actions {
	display: flex;
	gap: 8px;
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid var(--border);
	justify-content: flex-end;
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
	outline: none;
	cursor: pointer;
}

.scripture-selector select:focus {
	border-color: var(--primary);
}

.scripture-selector select:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

/* Buttons */
.btn {
	padding: 10px 16px;
	background: var(--bg);
	border: 1px solid var(--border);
	border-radius: 6px;
	color: var(--text);
	font-size: 14px;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.15s;
	white-space: nowrap;
}

.btn:hover, .btn:active {
	background: var(--bg-hover);
}

.btn-small {
	padding: 6px 10px;
	font-size: 12px;
}

.btn-primary {
	background: var(--primary);
	border-color: var(--primary);
}

.btn-primary:hover, .btn-primary:active {
	background: var(--primary-hover);
}

.btn-secondary {
	background: transparent;
	border-color: var(--primary);
	color: var(--primary);
}

.btn-secondary:hover, .btn-secondary:active {
	background: rgba(59, 130, 246, 0.1);
}

.btn-close {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	background: transparent;
	border: none;
	color: var(--text-muted);
	font-size: 24px;
	cursor: pointer;
	border-radius: 4px;
}

.btn-close:hover {
	background: var(--bg-hover);
	color: var(--text);
}

/* Preview Modal */
.preview-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 200;
	padding: 20px;
	animation: fadeIn 0.2s ease;
}

.preview-modal {
	background: var(--bg-card);
	border: 1px solid var(--border);
	border-radius: 12px;
	width: 100%;
	max-width: 500px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.preview-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16px;
	border-bottom: 1px solid var(--border);
}

.preview-header h3 {
	font-size: 16px;
	font-weight: 600;
}

.preview-content {
	flex: 1;
	padding: 16px;
	overflow-y: auto;
}

.preview-display {
	aspect-ratio: 16 / 9;
	background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
	border-radius: 8px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 24px;
	text-align: center;
}

.preview-display p {
	font-size: 18px;
	line-height: 1.6;
	color: white;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	margin: 4px 0;
}

.preview-actions {
	display: flex;
	gap: 8px;
	padding: 16px;
	border-top: 1px solid var(--border);
	justify-content: flex-end;
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
	z-index: 100;
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

.nav-btn.danger:hover, .nav-btn.danger:active {
	background: #dc2626;
}

/* Empty state */
.empty-state {
	text-align: center;
	padding: 40px 20px;
	color: var(--text-muted);
}

/* Utility */
.mb-16 { margin-bottom: 16px; }

/* Mobile adjustments */
@media (max-width: 400px) {
	.scripture-selector {
		grid-template-columns: 1fr;
	}
	
	.verse-item .list-item-actions {
		flex-wrap: wrap;
	}
	
	.btn {
		padding: 8px 12px;
		font-size: 13px;
	}
}
`;
