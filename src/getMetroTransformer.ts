import { Node } from "@babel/core"
import { RawSourceMap, SourceMapConsumer } from "source-map"
import * as semver from "semver"
import {
  MetroRawSourceMap,
  convertStandardSourceMapToMetroRawSourceMap,
} from "./composeSourceMaps"
import * as babylon from "@babel/parser"
import traverse from "@babel/traverse"
import generate from "@babel/generator";

export interface MetroTransformerResult {
  ast?: Node
  code?: string
  map?: string | RawSourceMap | MetroRawSourceMap
}

export interface MetroTransformer {
  transform(props: {
    filename: string
    src: string
    options: {
      dev?: boolean
      retainLines?: boolean
      // others unused
    }
  }): MetroTransformerResult
  getCacheKey?(): string
}

function getReactNativeMinorVersion(): number {
  const reactNativeVersionString = require("react-native/package.json").version

  const parseResult = semver.parse(reactNativeVersionString)

  if (!parseResult) {
    throw new Error(
      `Can't parse react-native version string '${reactNativeVersionString}'`,
    )
  }

  return parseResult.minor
}

export function getMetroTransformer(
  reactNativeMinorVersion: number = getReactNativeMinorVersion(),
): MetroTransformer {
  if (reactNativeMinorVersion >= 59) {
    return require('metro-react-native-babel-transformer/src/index')
  } else if (reactNativeMinorVersion >= 56) {
    return require("metro/src/reactNativeTransformer")
  } else if (reactNativeMinorVersion >= 52) {
    return require("metro/src/transformer")
  } else if (reactNativeMinorVersion >= 0.47) {
    return require("metro-bundler/src/transformer")
  } else if (reactNativeMinorVersion === 0.46) {
    return require("metro-bundler/build/transformer")
  } else {
    throw new Error(
      `react-native-obfuscating-transformer requires react-native >= 0.46`,
    )
  }
}

export interface ReactNativeObfuscatingTransformerDefaultResult {
  code: string
  map: string
}

export function maybeTransformMetroResult(
  upstreamResult: MetroTransformerResult,
  { code, map }: ReactNativeObfuscatingTransformerDefaultResult,
  reactNativeMinorVersion: number = getReactNativeMinorVersion(),
): MetroTransformerResult {
  if (reactNativeMinorVersion >= 52) {
    // convert code and map to ast
    const ast = babylon.parse(code, {
      sourceType: "module",
    })

    const mapConsumer = new SourceMapConsumer(map as any) // upstream types are wrong
      ; (traverse as any).cheap(ast, (node: Node) => {
        if (node.loc) {
          const originalStart = mapConsumer.originalPositionFor(node.loc.start)
          if (originalStart.line) {
            node.loc.start.line = originalStart.line
            node.loc.start.column = originalStart.column
          }
          const originalEnd = mapConsumer.originalPositionFor(node.loc.end)
          if (originalEnd.line) {
            node.loc.end.line = originalEnd.line
            node.loc.end.column = originalEnd.column
          }
        }
      })

    return { ast }
  } else if (Array.isArray(upstreamResult.map)) {
    return { code, map: convertStandardSourceMapToMetroRawSourceMap(map) }
  } else {
    return { code, map }
  }
}

export function generateAndConvert(ast: Node, filename: string): MetroTransformerResult {
  let generatorResult = generate(ast, {
    filename: filename,
    retainLines: true,
    sourceMaps: true,
    sourceFileName: filename,
  });

  if (!generatorResult.map) {
    return {code: generatorResult.code};
  }

  const map = {
    version: generatorResult.map.version + "",
    mappings: generatorResult.map.mappings,
    names: generatorResult.map.names,
    sources: generatorResult.map.sources,
    sourcesContent: generatorResult.map.sourcesContent,
    file: generatorResult.map.file
  }

  return {code: generatorResult.code, map: map};
}
