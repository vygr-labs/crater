/**
 * NDI Sender Service
 *
 * Streams the projection window as an NDI source so OBS, Streamlabs, vMix,
 * TriCaster, etc. can consume Crater's output over the network.
 *
 * Pipeline:
 *   projectionWindow.webContents.beginFrameSubscription(cb)
 *     -> NativeImage.getBitmap() (BGRA, tightly packed)
 *     -> sender.sendVideoAsync({ fourCC: BGRA, ... })
 *
 * NDI's clockVideo:true paces output for receivers, so jitter from Electron's
 * compositor is absorbed without us needing to time anything by hand.
 */

import type { BrowserWindow, NativeImage } from "electron";
import * as ndi from "@vygr-labs/ndi-node";
import logger from "../logger.js";

export interface NDISenderConfig {
	name: string;
	frameRate: number;
	width: number;
	height: number;
}

export interface NDISenderStatus {
	isStreaming: boolean;
	name: string;
	frameRate: number;
	resolution: { width: number; height: number };
	framesSent: number;
	errors: number;
	error?: string;
	sourceName?: string | null;
	connections?: number;
}

const DEFAULT_CONFIG: NDISenderConfig = {
	name: "Crater Bible Projection",
	frameRate: 30,
	width: 1920,
	height: 1080,
};

class NDISender {
	private config: NDISenderConfig = DEFAULT_CONFIG;
	private sender: ndi.Sender | null = null;
	private window: BrowserWindow | null = null;
	private frameSubscribed = false;
	private isStreaming = false;
	private framesSent = 0;
	private errors = 0;
	private lastError: string | undefined;
	private ndiInitialized = false;

	/**
	 * Make sure the NDI runtime is loaded. Safe to call multiple times.
	 * Idempotent because ndi.initialize() is itself idempotent.
	 */
	private ensureInitialized(): boolean {
		if (this.ndiInitialized) return true;
		try {
			const ok = ndi.initialize();
			if (!ok) {
				this.lastError = "ndi.initialize() returned false";
				logger.error("NDI initialization failed");
				return false;
			}
			this.ndiInitialized = true;
			logger.info("NDI initialized", { version: ndi.version() });
			return true;
		} catch (err) {
			this.lastError =
				err instanceof Error ? err.message : "Unknown NDI init error";
			logger.error("NDI initialize threw", this.lastError);
			return false;
		}
	}

	/**
	 * Returns true when the native NDI addon loaded successfully. We surface
	 * this to the UI so we can show a friendly "NDI unavailable" state instead
	 * of crashing.
	 */
	isSupportedCPU(): boolean {
		return this.ensureInitialized();
	}

	getVersion(): string {
		try {
			return ndi.version() ?? "Unknown";
		} catch {
			return "Unavailable";
		}
	}

	/**
	 * Begin streaming a BrowserWindow as an NDI source.
	 *
	 * We use beginFrameSubscription with onlyDirty=false so we always have a
	 * full frame to forward — partial dirty-rect frames can't be sent over NDI
	 * directly without a compositor we don't have here.
	 */
	async start(
		window: BrowserWindow,
		config: Partial<NDISenderConfig> = {},
	): Promise<boolean> {
		this.config = { ...DEFAULT_CONFIG, ...this.config, ...config };

		if (this.isStreaming) {
			logger.warn("NDI already streaming; ignoring start()");
			return true;
		}

		if (!this.ensureInitialized()) return false;

		try {
			this.sender = new ndi.Sender({
				name: this.config.name,
				clockVideo: true,
				clockAudio: false,
			});
		} catch (err) {
			this.lastError =
				err instanceof Error ? err.message : "Sender construction failed";
			logger.error("Failed to create NDI sender", this.lastError);
			this.sender = null;
			return false;
		}

		this.window = window;
		this.framesSent = 0;
		this.errors = 0;
		this.lastError = undefined;

		// Frame rate is sent as a rational; 30000/1001 = 29.97 (broadcast safe).
		// We honour the user-requested integer rate but always express it as a
		// rational so NDI receivers display it correctly.
		const frameRateN = this.config.frameRate * 1000;
		const frameRateD = 1000;

		// Electron's compositor fires frame callbacks at the OS's refresh rate
		// (often 60Hz). At a configured 30fps NDI output, half those frames
		// would just be redundant work — getBitmap() copies, NDI re-encodes.
		// Throttle to the configured rate by skipping callbacks that arrive
		// less than minFrameIntervalMs after the previous send.
		const minFrameIntervalMs = 1000 / this.config.frameRate;
		let lastSentAt = 0;

		const onFrame = (image: NativeImage) => {
			if (!this.sender || !this.isStreaming) return;
			const now = Date.now();
			if (now - lastSentAt < minFrameIntervalMs * 0.95) return;
			lastSentAt = now;
			try {
				const size = image.getSize();
				// Electron 38's NativeImage.getBitmap returns a tightly-packed
				// BGRA Buffer; the older TypeScript bundled with this repo has
				// the return typed as void, so we cast through unknown.
				const bitmap = image.getBitmap() as unknown as Buffer;
				if (!bitmap || bitmap.length === 0) return;

				this.sender.sendVideoAsync({
					xres: size.width,
					yres: size.height,
					fourCC: ndi.FourCC.BGRA,
					frameRateN,
					frameRateD,
					frameFormatType: ndi.FrameFormat.PROGRESSIVE,
					lineStrideInBytes: size.width * 4,
					data: bitmap,
				});
				this.framesSent++;
			} catch (err) {
				this.errors++;
				this.lastError =
					err instanceof Error ? err.message : "Unknown frame send error";
				if (this.errors === 1 || this.errors % 100 === 0) {
					logger.error("NDI sendVideoAsync failed", this.lastError);
				}
			}
		};

		try {
			window.webContents.beginFrameSubscription(false, onFrame);
			this.frameSubscribed = true;
		} catch (err) {
			this.lastError =
				err instanceof Error
					? err.message
					: "beginFrameSubscription failed";
			logger.error("Failed to subscribe to projection frames", this.lastError);
			this.sender.destroy();
			this.sender = null;
			return false;
		}

		// If the projection window is closed externally we must tear down or
		// we'll leak the subscription and crash on the next frame callback.
		window.once("closed", () => {
			if (this.window === window) this.stop();
		});

		this.isStreaming = true;
		logger.info("NDI streaming started", {
			name: this.config.name,
			source: this.sender.getSourceName(),
		});
		return true;
	}

	stop(): void {
		if (this.window && this.frameSubscribed) {
			try {
				this.window.webContents.endFrameSubscription();
			} catch {
				// Window may already be destroyed; nothing to clean up.
			}
		}
		this.frameSubscribed = false;
		this.window = null;

		if (this.sender) {
			try {
				this.sender.destroy();
			} catch (err) {
				logger.warn(
					"NDI sender destroy threw",
					err instanceof Error ? err.message : err,
				);
			}
			this.sender = null;
		}

		if (this.isStreaming) {
			logger.info("NDI streaming stopped", { framesSent: this.framesSent });
		}
		this.isStreaming = false;
	}

	async updateConfig(config: Partial<NDISenderConfig>): Promise<boolean> {
		const wasStreaming = this.isStreaming;
		const window = this.window;
		this.config = { ...this.config, ...config };

		// Sender name is fixed once created, and frame rate is baked into the
		// outgoing frames — for both we restart the sender to apply changes.
		if (wasStreaming && window) {
			this.stop();
			return this.start(window, this.config);
		}
		return true;
	}

	getStatus(): NDISenderStatus {
		let connections: number | undefined;
		let sourceName: string | null | undefined;
		if (this.sender) {
			try {
				connections = this.sender.getConnections(0);
				sourceName = this.sender.getSourceName();
			} catch {
				/* non-fatal */
			}
		}
		return {
			isStreaming: this.isStreaming,
			name: this.config.name,
			frameRate: this.config.frameRate,
			resolution: {
				width: this.config.width,
				height: this.config.height,
			},
			framesSent: this.framesSent,
			errors: this.errors,
			error: this.lastError,
			sourceName,
			connections,
		};
	}

	/**
	 * Release the NDI runtime entirely. Call on app quit.
	 */
	shutdown(): void {
		this.stop();
		if (this.ndiInitialized) {
			try {
				ndi.destroy();
			} catch (err) {
				logger.warn(
					"ndi.destroy threw",
					err instanceof Error ? err.message : err,
				);
			}
			this.ndiInitialized = false;
		}
	}
}

export const ndiSender = new NDISender();

export default ndiSender;
