import { Node } from "babel-core"
import { RawSourceMap, SourceMapConsumer } from "source-map"
import * as semver from "semver"
import { MetroRawSourceMap } from "./composeSourceMaps"
import * as babylon from "babylon"
import traverse from "babel-traverse"

export interface MetroTransformerResult {
  ast?: Node
  code?: string
  map?: string | RawSourceMap | MetroRawSourceMap
}

export interface MetroTransformer {
  transform(props: {
    filename: string
    src: string
    options: object
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
  if (reactNativeMinorVersion >= 52) {
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
  { code, map }: ReactNativeObfuscatingTransformerDefaultResult,
  reactNativeMinorVersion: number = getReactNativeMinorVersion(),
): ReactNativeObfuscatingTransformerDefaultResult | { ast: Node } {
  if (reactNativeMinorVersion >= 52) {
    // convert code and map to ast
    const ast = babylon.parse(code, {
      sourceType: "module",
    })

    const mapConsumer = new SourceMapConsumer(map as any) // upstream types are wrong
    ;(traverse as any).cheap(ast, (node: Node) => {
      if (node.loc) {
        const originalStart = mapConsumer.originalPositionFor(node.loc.start)
        if (originalStart.line) {
          node.loc.start.line = originalStart.line
          node.loc.start.column = originalStart.column
        }
        const originalEnd = mapConsumer.originalPositionFor(node.loc.end)
        if (originalEnd.line) {
          node.loc.start.line = originalEnd.line
          node.loc.start.column = originalEnd.column
        }
      }
    })

    return { ast }
  } else {
    return { code, map }
  }
}
