import { chapter as chapterError } from "./errors"

const getChapter = (cv, strChapter) => {
  const chapter = parseInt(strChapter)
  if (0 < chapter && chapter <= cv.book.chapters) {
    cv.chapter = chapter
    return cv
  }
  return chapterError
}

export default getChapter
