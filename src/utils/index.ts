import { BookInfo, ChapterCountObj, HighlightedVerse } from './types'

export function getName(book?: BookInfo) {
	return book?.name?.toLowerCase() ?? ''
}

export function sendMessage(
	channel: BroadcastChannel,
	message: Record<string, any>
) {
	channel.postMessage({ ...message, type: 'message' })
}

export function isValidBookAndChapter(
	book: string,
	chapter: number,
	chapterData: ChapterCountObj
) {
	const maxChapter = chapterData[book]
	if (!maxChapter) {
		return { valid: false, message: `The book "${book}" does not exist.` }
	}

	if (chapter < 1 || chapter > maxChapter) {
		return {
			valid: false,
			message: `The book "${book}" does not have chapter "${chapter}".`,
		}
	}

	return { valid: true }
}

export function getMeasurement(value: string = '') {
	const res = value.toString()?.match(/(-?[\d.]+)([a-z%]*)/)
	return res?.[2] ?? 'px'
}

export function determineColor(color: string) {
	return color === 'transparent' ? 'rgba(0,0,0,0)' : color
}

export function getReference(data: HighlightedVerse) {
	return `${data.book} ${data.chapter}:${data.verse} ${data.version}`
}

export function capitalizeFirstLetter(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getKeyByValue(object, value) {
	return Object.keys(object).find(key => object[key] === value)
}

export const getToastType = (success: boolean) =>
	success ? 'success' : 'error'
