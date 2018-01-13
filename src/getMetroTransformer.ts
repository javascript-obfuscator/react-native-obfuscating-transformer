import { Node } from "babel-core"
import { RawSourceMap } from "source-map"
import * as semver from "semver"
import { MetroRawSourceMap } from "./composeSourceMaps"

export interface MetroTransformer {
  transform(props: {
    filename: string
    src: string
    options: object
  }): {
    ast?: Node
    code?: string
    map?: string | RawSourceMap | MetroRawSourceMap
  }
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
