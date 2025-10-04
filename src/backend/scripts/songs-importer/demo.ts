// Working custom rtf converter from jamesinglis functions.php

// interface RtfState {
// 	[key: string]: boolean | number | string | undefined
// 	uc?: number
// }

// const IGNORED_GROUPS = new Set([
// 	'*',
// 	'fonttbl',
// 	'colortbl',
// 	'datastore',
// 	'theme_data',
// ])
// const CONTROL_SYMBOLS = new Set(['~', '_', '-', '{', '}', '\\'])

// function isContentAllowed(stack: RtfState): boolean {
// 	return !Object.keys(stack).some(key => IGNORED_GROUPS.has(key))
// }

// export function rtfToText(rtfContent: string): string {
// 	let output = ''
// 	const stack: RtfState[] = [{}]
// 	let groupIndex = 0
// 	let skipCount = 0

// 	for (let i = 0; i < rtfContent.length; i++) {
// 		if (skipCount > 0) {
// 			skipCount--
// 			continue
// 		}

// 		const char = rtfContent[i]

// 		switch (char) {
// 			case '\\':
// 				const nextChar = rtfContent[i + 1]

// 				// Handle ignorable group marker
// 				if (nextChar === '*') {
// 					stack[groupIndex]['*'] = true
// 					i++
// 					break
// 				}

// 				// Handle control symbols
// 				if (CONTROL_SYMBOLS.has(nextChar)) {
// 					if (isContentAllowed(stack[groupIndex])) {
// 						output += nextChar === '~' ? ' ' : nextChar
// 					}
// 					i++
// 					break
// 				}

// 				// Handle hex characters
// 				if (nextChar === "'") {
// 					if (isContentAllowed(stack[groupIndex])) {
// 						const hex = rtfContent.substr(i + 2, 2)
// 						output += String.fromCharCode(parseInt(hex, 16))
// 					}
// 					i += 3
// 					break
// 				}

// 				// Parse control words
// 				let word = ''
// 				let param = ''
// 				let ptr = i + 1

// 				while (ptr < rtfContent.length) {
// 					const c = rtfContent[ptr]
// 					if (/[a-zA-Z]/.test(c)) {
// 						word += c.toLowerCase()
// 					} else if (/\d|-/.test(c) && word.length > 0) {
// 						param += c
// 					} else {
// 						break
// 					}
// 					ptr++
// 				}

// 				i = ptr - 1
// 				const numericParam = param ? parseInt(param, 10) : 0

// 				// Process special commands
// 				if (isContentAllowed(stack[groupIndex])) {
// 					switch (word) {
// 						case 'u':
// 							output += String.fromCharCode(numericParam)
// 							if (stack[groupIndex].uc) {
// 								skipCount = stack[groupIndex].uc as number
// 							}
// 							break
// 						case 'par':
// 						case 'line':
// 							output += '\n\n'
// 							break
// 						case 'tab':
// 							output += '\t'
// 							break
// 						case 'emdash':
// 							output += '—'
// 							break
// 						case 'endash':
// 							output += '–'
// 							break
// 					}
// 				}

// 				// Store other control words in stack
// 				if (word.length > 0 && !['u', 'par', 'line', 'tab'].includes(word)) {
// 					stack[groupIndex][word] = param || true
// 				}
// 				break

// 			case '{':
// 				stack.push({ ...stack[groupIndex] })
// 				groupIndex++
// 				break

// 			case '}':
// 				if (groupIndex > 0) {
// 					stack.pop()
// 					groupIndex--
// 				}
// 				break

// 			default:
// 				if (
// 					isContentAllowed(stack[groupIndex]) &&
// 					char !== '\r' &&
// 					char !== '\f'
// 				) {
// 					output += char
// 				}
// 				break
// 		}
// 	}

// 	// Clean up residual artifacts
// 	return output
// 		.replace(/\* \d+/g, '') // Remove * 20 patterns
// 		.replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
// 		.replace(/[ \t]{2,}/g, ' ') // Collapse multiple spaces
// 		.trim()
// }

// async function rtfToText(rtfContent: string): Promise<string> {
// 	return new Promise((resolve, reject) => {
// 		parse.string(rtfContent, (err: any, doc: any) => {
// 			if (err) return reject(err)

// 			let text = ''
// 			doc.content.forEach((paragraph: any) => {
// 				text +=
// 					paragraph.content.map((content: any) => content.value).join('') +
// 					'\n\n'
// 			})

// 			resolve(postProcessText(text))
// 		})
// 	})
// }
