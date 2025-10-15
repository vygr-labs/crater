// config.ts
import { __dirname } from "../../constants.js";

export const TEST_MODE = false;
export const TEST_SINGLE_SONG_ID: number | false = false;
console.log(__dirname);

export const PATHS = {
	SONG_DB: `${__dirname}/Songs.db`,
	SONG_WORDS_DB: `${__dirname}/SongWords.db`,
	OUTPUT_DIR: `${__dirname}/output/`,
};

export const CUSTOM_SETTINGS = {
	capitalizeNames: false,
	removeEndPunctuation: false,
	fixMidLinePunctuation: false,
	straightenCurlyQuotes: false,
	removeX2: false,
	startWithCapital: false,
	standardizeSongSections: false,
	standardizeTitleFormat: false,
	preventOverwrites: true,
	addMetadataToExportFiles: false,
	condenseSlideBreaks: false,
	reflowLargeBlocks: false,
	outputSubdirectory: false,
	aggressiveTextEncoding: false,
	prop6AddBlankIntro: false,
	prop6AddBlankEnd: false,
	prop6AddHotkeys: false,
};

export const REFLOW_MAX_LINES = 2;
export const FILE_EXPORT_TYPE: "plain_text" | "propresenter6" = "plain_text";

export const SONG_SECTION_NAMES = [
	"Verse",
	"Chorus",
	"Pre-Chorus",
	"Bridge",
	"Tag",
	"Intro",
	"End",
];

export const WORDS_TO_CAPITALIZE = [
	"Jesus",
	"God",
	"Gud",
	"Lord",
	"You",
	"Your",
	"Du",
	"Din",
	"Ditt",
	"Han",
	"Hans",
	"Ham",
	"Holy Spirit",
	"Father",
];

export interface Song {
	id: number;
	title: string;
	author?: string;
	copyright?: string;
	ccli_number?: string;
	text?: string;
}
