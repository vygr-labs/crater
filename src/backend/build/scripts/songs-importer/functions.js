// functions.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";
import rtfParse from "rtf-parse";
import Group from "rtf-parse/src/rtf/model/Group.js";
import Command from "rtf-parse/src/rtf/model/Command.js";
import RTFText from "rtf-parse/src/rtf/model/Text.js";
import {
	CUSTOM_SETTINGS,
	FILE_EXPORT_TYPE,
	PATHS,
	SONG_SECTION_NAMES,
	WORDS_TO_CAPITALIZE,
} from "./config.js";
import songDB from "../../database/songs-db.js";
const EW6_EXPORT_EOL = "\r\n";
// Helper functions
const ucwords = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
const phpExplode = (separator, str) => str.split(separator);
// const phpImplode = (separator: string, array: string[]) => array.join(separator)
// Unicode processing
export function processUnicode(text) {
	return text
		.replace(/\\x([0-9A-F]{2})\?/g, "&#x$1;")
		.replace(/\\u(\d+)\?/g, "&#$1;")
		.replace(/&#x([0-9A-F]{2});/gi, (_, code) =>
			String.fromCharCode(parseInt(code, 16)),
		)
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}
// Song title processing
export function processEwTitle(title) {
	let processed = title.trim().replace(/\s+/g, " ");
	if (CUSTOM_SETTINGS.standardizeTitleFormat) {
		processed = processed
			.split(" ")
			.map((word) => ucwords(word.toLowerCase()))
			.join(" ");
		["and", "of", "the"].forEach((word) => {
			processed = processed.replace(
				new RegExp(`\\b${ucwords(word)}\\b`, "g"),
				word,
			);
		});
		processed = processed.charAt(0).toUpperCase() + processed.slice(1);
	}
	return processed;
}
// Main lyrics processing function
export async function processEwLyrics(text) {
	let processed = processUnicode(text);
	try {
		processed = await rtfToText(processed);
	} catch (error) {
		console.error("RTF parsing failed, using fallback:", error);
		processed = fallbackRtfConversion(text);
	}
	// Convert paragraph separators to double newlines
	console.log("After rtfToText & paragraph replacements: ", processed);
	// Processing pipeline
	let lines = phpExplode("\n", processed)
		.map((line) => processEwLyricsLine(line))
		.filter((line) => line.length > 0);
	lines = lines.map((line) => processEwLyricsLineCustom(line));
	lines = phpExplode("\n", processed).map((line) =>
		processEwLyricsLineSongParts(line),
	);
	// Final cleanup while preserving paragraph spacing
	return processEwBlocks(lines.join("\n")).trim();
}
function extractText(nodes) {
	let text = "";
	for (const node of nodes) {
		if (node instanceof Group) {
			// Check for various types of non-content groups
			const isIgnorableGroup = node.children.some(
				(child) => child instanceof RTFText && child.value === "\\*", // \* groups
			);
			const isFontTable = node.children.some(
				(child) => child instanceof Command && child.name === "fonttbl",
			);
			const isColorTable = node.children.some(
				(child) => child instanceof Command && child.name === "colortbl",
			);
			const isStyleSheet = node.children.some(
				(child) => child instanceof Command && child.name === "stylesheet",
			);
			const isFontDefinition = node.children.some(
				(child) =>
					child instanceof Command && child.name.startsWith("fcharset"),
			);
			// Skip processing for non-content groups
			if (
				!isIgnorableGroup &&
				!isFontTable &&
				!isColorTable &&
				!isStyleSheet &&
				!isFontDefinition
			) {
				text += extractText(node.children);
			}
		} else if (node instanceof RTFText) {
			text += node.value;
		} else if (node instanceof Command) {
			// Handle paragraph breaks and maintain basic formatting
			if (node.name === "par" || node.name === "line") {
				text += "\n";
			}
		}
	}
	return text;
}
// // RTF to Text conversion
async function rtfToText(rtfContent) {
	// console.log('RTF TO Text----------------')
	// console.log(rtfContent)
	const doc = await rtfParse.parseString(rtfContent);
	// console.log(doc.children)
	const text = extractText(doc.children);
	// console.log('Extracted Text: ', text)
	// console.log(text)
	// console.log(rtfContent)
	return text;
	// return doc.children.map((p: any) => p.text).join('\n\n')
}
function fallbackRtfConversion(rtfContent) {
	return rtfContent
		.replace(/\\par\b|\\line\b/gi, "\n")
		.replace(/\\'([0-9a-f]{2})/gi, (_, hex) =>
			String.fromCharCode(parseInt(hex, 16)),
		)
		.replace(/\{\*?\\[^{}]+}|[{}]|\\\n?[A-Za-z]+\n?(?:[-+]?\d+)?[ ]?/g, "")
		.trim();
}
function processEwLyricsLine(line) {
	// Preserve empty lines that indicate paragraph breaks
	if (line.trim() === "") return "\n";
	return processUnicode(line)
		.trim()
		.replace(/^[().]$/g, "\n")
		.replace(/(Arial|Tahoma);/g, "\n")
		.trim();
}
function processEwLyricsLineCustom(line) {
	if (line.trim() === "") return "\n";
	let processed = line;
	// Capitalize specific words
	if (CUSTOM_SETTINGS.capitalizeNames) {
		WORDS_TO_CAPITALIZE.forEach((word) => {
			processed = processed.replace(new RegExp(`\\b${word}\\b`, "gi"), word);
		});
	}
	// Remove ending punctuation
	if (CUSTOM_SETTINGS.removeEndPunctuation) {
		processed = processed.replace(/[.,;]+ ?$/, "");
	}
	// Fix mid-line punctuation
	if (CUSTOM_SETTINGS.fixMidLinePunctuation) {
		processed = processed
			.replace(/\./g, "\n")
			.replace(/([,;?!])([^ ])/g, "$1 $2");
	}
	// Handle quotes
	if (CUSTOM_SETTINGS.straightenCurlyQuotes) {
		processed = processed.replace(/[‘’´]/g, "'").replace(/[“”]/g, '"');
	}
	// Remove x2 patterns
	if (CUSTOM_SETTINGS.removeX2) {
		processed = processed
			.replace(/(x\d+|\d+x)/gi, "")
			.replace(/\(\)|\[\]|\[ {2}\]/g, "");
	}
	// Capitalize first letter
	if (CUSTOM_SETTINGS.startWithCapital) {
		processed = processed.charAt(0).toUpperCase() + processed.slice(1);
	}
	// return processed.trim()
	return processed === "\n" ? "\n" : processed.trim();
}
function processEwLyricsLineSongParts(line) {
	let processed = line;
	const sectionRegex = new RegExp(`^(${SONG_SECTION_NAMES.join("|")})`, "i");
	// Standardize section names
	if (CUSTOM_SETTINGS.standardizeSongSections) {
		const match = line.match(/^(Verse|Chorus|Bridge)\s?(\d*)/i);
		if (match) {
			processed = `${ucwords(match[1].toLowerCase())} ${match[2] || "1"}`;
		} else if (/^Pre-?Chorus/i.test(line)) {
			processed = "Pre-Chorus";
		} else if (/^(Tag|Intro)\d*$/i.test(line)) {
			processed = ucwords(line.toLowerCase());
		}
	}
	// Add line breaks before sections
	if (sectionRegex.test(processed)) {
		processed = `\n\n${processed}`;
	}
	return processed;
}
// Metadata processing
export function processEwLyricsMetadata(song) {
	const meta = [
		`Title: ${song.title}`,
		song.author && `Author: ${song.author}`,
		song.copyright && `Copyright: ${song.copyright}`,
		song.ccli_number && `CCLI: ${song.ccli_number}`,
	]
		.filter(Boolean)
		.join("\n");
	return meta ? `${meta}\n\n` : "";
}
// Block processing
function processEwBlocks(text) {
	return phpExplode("\n\n", text.trim())
		.map((block) => {
			const lines = phpExplode("\n", block);
			const headingMatch = lines[0].match(
				new RegExp(`^(${SONG_SECTION_NAMES.join("|")})`, "i"),
			);
			if (headingMatch) {
				return `${headingMatch[0]}\n${lines.slice(1).join("\n")}`;
			}
			return lines.join("\n");
		})
		.join("\n\n"); // Maintain paragraph spacing between blocks
}
// File saving function
export function saveTextFile(song, lyrics) {
	let outputDir = PATHS.OUTPUT_DIR;
	// Create timestamped subdirectory if enabled
	if (CUSTOM_SETTINGS.outputSubdirectory) {
		const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
		outputDir = path.join(outputDir, `${timestamp}_${FILE_EXPORT_TYPE}`);
		fs.mkdirSync(outputDir, { recursive: true });
	}
	// Sanitize filename
	let filename = song.title
		.replace(/[<>:"\\|?*]/g, "") // Remove illegal characters
		.replace(/\s+/g, " ") // Collapse multiple spaces
		.trim();
	// Add file extension
	const ext = FILE_EXPORT_TYPE === "propresenter6" ? ".pro6" : ".txt";
	filename += ext;
	// Prevent overwrites
	if (CUSTOM_SETTINGS.preventOverwrites) {
		const parsed = path.parse(filename);
		let counter = 1;
		const baseName = parsed.name;
		while (fs.existsSync(path.join(outputDir, filename))) {
			filename = `${baseName} (${counter++})${ext}`;
		}
	}
	// Build content
	let content = "";
	if (
		CUSTOM_SETTINGS.addMetadataToExportFiles &&
		FILE_EXPORT_TYPE !== "propresenter6"
	) {
		content += processEwLyricsMetadata(song);
	}
	content += lyrics;
	// Handle text encoding
	if (CUSTOM_SETTINGS.aggressiveTextEncoding) {
		content = Buffer.from(content, "utf8").toString("latin1");
	}
	// Write file with BOM
	fs.writeFileSync(
		path.join(outputDir, filename),
		`\uFEFF${content.replace(/\n/g, EW6_EXPORT_EOL)}`,
	);
}
// ProPresenter GUID generator
export function generateProPresenterGuid() {
	return crypto
		.randomBytes(16)
		.toString("hex")
		.toUpperCase()
		.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, "$1-$2-$3-$4-$5");
}
export function saveSongToDatabase(song, lyrics) {
	// Start a transaction
	const insertTransaction = songDB.transaction(() => {
		// First, insert the main song record
		const songStmt = songDB.prepare(`
			INSERT INTO songs (title, author, copyright)
			VALUES (@title, @author, @copyright)
			RETURNING id
		`);
		// ON CONFLICT(title) DO UPDATE SET
		// 		author = excluded.author,
		// 		copyright = excluded.copyright,
		// 		updated_at = CURRENT_TIMESTAMP
		const songResult = songStmt.get({
			title: song.title,
			author: song.author || null,
			copyright: song.copyright || null,
		});
		const songId = songResult.id;
		// Process lyrics into structured format
		const sections = lyrics
			.split("\n\n")
			.filter((section) => section.trim() !== "");
		const lyricRecords = sections.map((section, index) => {
			const lines = section.split("\n").filter((line) => line.trim() !== "");
			const isSectionHeader = SONG_SECTION_NAMES.some((name) =>
				lines[0].toLowerCase().startsWith(name.toLowerCase()),
			);
			return {
				label: isSectionHeader ? lines.shift() : ``,
				lyrics: JSON.stringify(lines),
				order: index + 1,
			};
		});
		// Insert lyrics sections
		const lyricStmt = songDB.prepare(`
					INSERT INTO song_lyrics (song_id, label, lyrics, "order")
					VALUES (@songId, @label, @lyrics, @order)
			`);
		lyricRecords.forEach((record) => {
			lyricStmt.run({
				songId,
				label: record.label,
				lyrics: record.lyrics,
				order: record.order,
			});
		});
		return songId;
	});
	try {
		const songId = insertTransaction();
		console.log(`Successfully saved song "${song.title}" with ID: ${songId}`);
	} catch (error) {
		console.error("Error saving song to database:", error);
		throw new Error("Failed to save song to database");
	}
}
