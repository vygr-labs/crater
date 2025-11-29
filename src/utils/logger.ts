/**
 * Frontend logging utility
 * Logs to both console and main process (via electron IPC)
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
	level: LogLevel;
	message: string;
	args: unknown[];
	timestamp: Date;
}

// Store recent logs in memory for debugging
const recentLogs: LogEntry[] = [];
const MAX_MEMORY_LOGS = 500;

const addToMemory = (entry: LogEntry) => {
	recentLogs.push(entry);
	if (recentLogs.length > MAX_MEMORY_LOGS) {
		recentLogs.shift();
	}
};

const formatMessage = (level: LogLevel, message: string): string => {
	const timestamp = new Date().toISOString();
	return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

const logToMain = (level: LogLevel, message: string, ...args: unknown[]) => {
	// Log to main process if electron API is available
	if (typeof window !== "undefined" && window.electronAPI?.log) {
		window.electronAPI.log[level](message, ...args);
	}
};

/**
 * Application logger - logs to console and electron main process
 */
export const appLogger = {
	info: (message: string, ...args: unknown[]) => {
		console.info(formatMessage("info", message), ...args);
		logToMain("info", message, ...args);
		addToMemory({ level: "info", message, args, timestamp: new Date() });
	},

	warn: (message: string, ...args: unknown[]) => {
		console.warn(formatMessage("warn", message), ...args);
		logToMain("warn", message, ...args);
		addToMemory({ level: "warn", message, args, timestamp: new Date() });
	},

	error: (message: string, ...args: unknown[]) => {
		console.error(formatMessage("error", message), ...args);
		logToMain("error", message, ...args);
		addToMemory({ level: "error", message, args, timestamp: new Date() });
	},

	debug: (message: string, ...args: unknown[]) => {
		console.debug(formatMessage("debug", message), ...args);
		logToMain("debug", message, ...args);
		addToMemory({ level: "debug", message, args, timestamp: new Date() });
	},

	/**
	 * Get recent logs stored in memory
	 */
	getRecentLogs: (): LogEntry[] => {
		return [...recentLogs];
	},

	/**
	 * Clear memory logs
	 */
	clearMemoryLogs: () => {
		recentLogs.length = 0;
	},

	/**
	 * Export logs to a file on user's desktop
	 */
	exportLogs: async () => {
		if (typeof window !== "undefined" && window.electronAPI?.exportLogs) {
			return await window.electronAPI.exportLogs();
		}
		return { success: false, error: "Electron API not available" };
	},

	/**
	 * Open the log folder in file explorer
	 */
	openLogFolder: async () => {
		if (typeof window !== "undefined" && window.electronAPI?.openLogFolder) {
			return await window.electronAPI.openLogFolder();
		}
		return false;
	},

	/**
	 * Get full log file contents
	 */
	getFullLogs: async (): Promise<string> => {
		if (typeof window !== "undefined" && window.electronAPI?.getLogs) {
			return await window.electronAPI.getLogs();
		}
		return "";
	},

	/**
	 * Get system information
	 */
	getSystemInfo: async (): Promise<string> => {
		if (typeof window !== "undefined" && window.electronAPI?.getSystemInfo) {
			return await window.electronAPI.getSystemInfo();
		}
		return "";
	},

	/**
	 * Clear all log files
	 */
	clearLogs: async () => {
		if (typeof window !== "undefined" && window.electronAPI?.clearLogs) {
			return await window.electronAPI.clearLogs();
		}
		return false;
	},

	/**
	 * Send logs via email to developer
	 */
	sendLogsEmail: async (userMessage: string = "") => {
		if (typeof window !== "undefined" && window.electronAPI?.sendLogsEmail) {
			return await window.electronAPI.sendLogsEmail(userMessage);
		}
		return { success: false, error: "Electron API not available" };
	},
};

// Create a global error handler to log uncaught errors
if (typeof window !== "undefined") {
	window.addEventListener("error", (event) => {
		appLogger.error(`Uncaught error: ${event.message}`, {
			filename: event.filename,
			lineno: event.lineno,
			colno: event.colno,
		});
	});

	window.addEventListener("unhandledrejection", (event) => {
		appLogger.error(`Unhandled promise rejection: ${event.reason}`);
	});
}

export default appLogger;
