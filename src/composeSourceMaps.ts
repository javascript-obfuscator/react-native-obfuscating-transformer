import { SourceMapConsumer, SourceMapGenerator, RawSourceMap } from "source-map"

export type MetroRawSourceMap = Array<
  [number, number, number, number, string | undefined]
>

export function convertMetroRawSourceMapToStandardSourceMap(
  map: MetroRawSourceMap,
  originalFileName: string,
  originalFileContent: string,
): string {
  const outputMap = new SourceMapGenerator()

  outputMap.setSourceContent(originalFileName, originalFileContent)

  map.forEach(args => {
    const [generatedLine, generatedColumn, originalLine, originalColumn] = args
    outputMap.addMapping({
      generated: {
        line: generatedLine,
        column: generatedColumn,
      },
      original: {
        line: originalLine,
        column: originalColumn,
      },
      source: originalFileName,
      name: args.length === 5 ? (args[4] as string) : undefined,
    })
  })

  return outputMap.toString()
}

export function convertStandardSourceMapToMetroRawSourceMap(
  map: RawSourceMap | string,
) {
  const consumer = new SourceMapConsumer(map as any) // upstream types are wrong

  const outputMap: MetroRawSourceMap = []

  consumer.eachMapping(mapping => {
    outputMap.push([
      mapping.generatedLine,
      mapping.generatedColumn,
      mapping.originalLine,
      mapping.originalColumn,
      mapping.name,
    ])
  })

  return outputMap
}

export function composeSourceMaps(
  sourceMap: string | RawSourceMap,
  targetMap: string | RawSourceMap,
  sourceFileName: string,
  sourceContent: string,
) {
  const tsConsumer = new SourceMapConsumer(sourceMap as any) // upstreeam types are wrong
  const babelConsumer = new SourceMapConsumer(targetMap as any)
  const map = new SourceMapGenerator()
  map.setSourceContent(sourceFileName, sourceContent)
  babelConsumer.eachMapping(
    ({
      generatedLine,
      generatedColumn,
      originalLine,
      originalColumn,
      name,
    }) => {
      if (originalLine) {
        const original = tsConsumer.originalPositionFor({
          line: originalLine,
          column: originalColumn,
        })
        if (original.line) {
          map.addMapping({
            generated: {
              line: generatedLine,
              column: generatedColumn,
            },
            original: {
              line: original.line,
              column: original.column,
            },
            source: sourceFileName,
            name: name,
          })
        }
      }
    },
  )
  return map.toString()
}
