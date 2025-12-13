/**
 * Remote Control Module
 * 
 * Exports the manager for use in main.ts
 */

export {
	startRemoteServer,
	stopRemoteServer,
	getRemoteServerStatus,
	updateRemoteState,
	setAppWindow,
	setRemoteCommandHandler,
	registerRemoteIpcHandlers,
	sendScheduleToRemote,
} from "./manager.js";

export type {
	RemoteAppState,
	RemoteSong,
	RemoteScheduleItem,
	ClientInfo,
} from "./types.js";
