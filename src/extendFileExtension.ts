export function extendFileExtension(filename: string, extensionPart: string) {
  const parts = filename.split(".")
  parts.splice(1, 0, extensionPart)
  return parts.join(".")
}
