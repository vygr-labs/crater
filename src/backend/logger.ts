import log from "electron-log";
import { app, shell } from "electron";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

// Configure electron-log
const LOG_DIR = path.join(app.getPath("userData"), "logs");

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
	fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Configure log file settings
log.transports.file.resolvePathFn = () => path.join(LOG_DIR, "crater.log");
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB max file size
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
log.transports.console.format = "[{h}:{i}:{s}] [{level}] {text}";

// Set log level based on environment
log.transports.file.level = "debug";
log.transports.console.level = "debug";

// Create a structured logger
const logger = {
	// Basic logging methods
	info: (message: string, ...args: unknown[]) => {
		log.info(`[Main] ${message}`, ...args);
	},
	warn: (message: string, ...args: unknown[]) => {
		log.warn(`[Main] ${message}`, ...args);
	},
	error: (message: string, ...args: unknown[]) => {
		log.error(`[Main] ${message}`, ...args);
	},
	debug: (message: string, ...args: unknown[]) => {
		log.debug(`[Main] ${message}`, ...args);
	},
	verbose: (message: string, ...args: unknown[]) => {
		log.verbose(`[Main] ${message}`, ...args);
	},

	// Log from renderer process
	renderer: (level: string, message: string, ...args: unknown[]) => {
		const logFn = log[level as keyof typeof log] as typeof log.info;
		if (typeof logFn === "function") {
			logFn(`[Renderer] ${message}`, ...args);
		}
	},

	// Get log file path
	getLogPath: (): string => {
		return path.join(LOG_DIR, "crater.log");
	},

	// Get log directory
	getLogDir: (): string => {
		return LOG_DIR;
	},

	// Read current log file contents
	getLogContents: (): string => {
		const logPath = path.join(LOG_DIR, "crater.log");
		if (fs.existsSync(logPath)) {
			return fs.readFileSync(logPath, "utf-8");
		}
		return "";
	},

	// Get system info for bug reports
	getSystemInfo: (): string => {
		return `
=== System Information ===
App Version: ${app.getVersion()}
Electron: ${process.versions.electron}
Chrome: ${process.versions.chrome}
Node: ${process.versions.node}
Platform: ${os.platform()} ${os.arch()}
OS Version: ${os.release()}
Total Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB
Free Memory: ${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB
CPUs: ${os.cpus().length} x ${os.cpus()[0]?.model || "Unknown"}
==============================
`;
	},

	// Prepare logs for sending (combines system info + recent logs)
	prepareLogsForSending: (): {
		systemInfo: string;
		logs: string;
		timestamp: string;
	} => {
		const logs = logger.getLogContents();
		const systemInfo = logger.getSystemInfo();
		const timestamp = new Date().toISOString();

		return {
			systemInfo,
			logs,
			timestamp,
		};
	},

	// Export logs to a file that user can share
	exportLogs: async (): Promise<string> => {
		const { systemInfo, logs, timestamp } = logger.prepareLogsForSending();
		const exportFileName = `crater-logs-${timestamp.replace(/[:.]/g, "-")}.txt`;
		const exportPath = path.join(app.getPath("desktop"), exportFileName);

		const content = `${systemInfo}\n=== Application Logs ===\n${logs}`;

		fs.writeFileSync(exportPath, content, "utf-8");
		return exportPath;
	},

	// Open log folder in file explorer
	openLogFolder: (): void => {
		shell.openPath(LOG_DIR);
	},

	// Generate mailto link with log summary
	generateSupportEmail: (userMessage: string = ""): string => {
		const { systemInfo } = logger.prepareLogsForSending();
		const subject = encodeURIComponent(
			`Crater Bug Report - ${app.getVersion()}`,
		);
		const body = encodeURIComponent(
			`${userMessage ? `User Message:\n${userMessage}\n\n` : ""}${systemInfo}\n\nPlease attach the exported log file to this email.`,
		);
		return `mailto:eyetukingsley330@gmail.com?subject=${subject}&body=${body}`;
	},

	// Clear old log files
	clearLogs: (): void => {
		const logPath = path.join(LOG_DIR, "crater.log");
		if (fs.existsSync(logPath)) {
			fs.writeFileSync(logPath, "", "utf-8");
		}
		logger.info("Logs cleared by user");
	},
};

// Log app startup
logger.info("=".repeat(50));
logger.info(`Crater Bible Project v${app.getVersion()} starting...`);
logger.info(logger.getSystemInfo());

export default logger;
export { LOG_DIR };
