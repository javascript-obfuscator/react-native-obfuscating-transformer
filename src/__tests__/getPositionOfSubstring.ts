export function getPositionOfSubstring(
  text: string,
  substring: string,
): { line: number; column: number } | null {
  const lines = text.split(/\r?\n/)

  for (let line = 0; line < lines.length; line++) {
    const column = lines[line].indexOf(substring)

    if (column >= 0) {
      return { line: line + 1, column }
    }
  }

  return null
}
