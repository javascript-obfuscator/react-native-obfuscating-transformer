import { getMetroTransformer } from "../getMetroTransformer"
import {
  convertMetroRawSourceMapToStandardSourceMap,
  MetroRawSourceMap,
  composeSourceMaps,
} from "../composeSourceMaps"
import * as fs from "fs"
import * as path from "path"
import { SourceMapConsumer } from "source-map/source-map"
import { getPositionOfSubstring } from "./getPositionOfSubstring"
import * as ts from "typescript"

const numberedLines = fs
  .readFileSync(require.resolve("./files/numberedLines.js"))
  .toString()

describe("convertMetroRawSourceMapToStandardSourceMap", () => {
  it("takes a raw source map and converts it to a non-raw source map", () => {
    const transformer = getMetroTransformer(47)

    const { map, code } = transformer.transform({
      filename: require.resolve("./files/numberedLines.js"),
      src: numberedLines,
      options: {
        retainLines: false,
      },
    })

    if (typeof code !== "string") {
      // use this rather than expect for typescript's sake
      throw new Error("code must be a string")
    }

    expect(Array.isArray(map)).toBe(true)
    expect(map).toMatchSnapshot()

    const standardMap = convertMetroRawSourceMapToStandardSourceMap(
      map as MetroRawSourceMap,
      path.join(__dirname, "numberedLines.js"),
      numberedLines,
    )

    const standardMapConsumer = new SourceMapConsumer(standardMap as any) // upstream types are wrong

    for (const substring of ["line1", "line2", "line3", "line5"])
      expect(
        standardMapConsumer.originalPositionFor(
          getPositionOfSubstring(code, substring)!,
        ),
      ).toMatchObject(getPositionOfSubstring(numberedLines, substring)!)

    expect(standardMap).toMatchSnapshot()
  })
})

describe("composeSourceMaps", () => {
  it("composes two source maps together", () => {
    const filename = require.resolve("./files/hello.ts")
    const hello = fs.readFileSync(filename).toString()

    const tsTranspileResult = ts.transpileModule(hello, {
      fileName: filename,
      compilerOptions: {
        sourceMap: true,
        target: ts.ScriptTarget.ES2015,
      },
    })

    expect(tsTranspileResult.outputText).toMatchSnapshot()

    const upstreamTransformResult = getMetroTransformer(47).transform({
      filename,
      src: tsTranspileResult.outputText,
      options: {
        retainLines: false,
      },
    })

    expect(upstreamTransformResult.code).toMatchSnapshot()

    const composedMap = new SourceMapConsumer(composeSourceMaps(
      tsTranspileResult.sourceMapText!,
      convertMetroRawSourceMapToStandardSourceMap(
        upstreamTransformResult.map as MetroRawSourceMap,
        filename,
        hello,
      ),
      filename,
      hello,
    ) as any) // upstream types are wrong

    expect(
      composedMap.originalPositionFor(
        getPositionOfSubstring(upstreamTransformResult.code!, "line6")!,
      ),
    ).toMatchObject({ line: 6 })

    expect(
      composedMap.originalPositionFor(
        getPositionOfSubstring(upstreamTransformResult.code!, "line8")!,
      ),
    ).toMatchObject({ line: 8 })
  })
})
