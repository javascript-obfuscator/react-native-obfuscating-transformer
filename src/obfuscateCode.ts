import * as Obfuscator from "javascript-obfuscator"
import {
  convertMetroRawSourceMapToStandardSourceMap,
  composeSourceMaps,
  MetroRawSourceMap,
} from "./composeSourceMaps"
import { RawSourceMap } from "source-map/source-map"

export function obfuscateCode(
  code: string,
  options: Obfuscator.Options,
): string {
  return Obfuscator.obfuscate(code, options).getObfuscatedCode()
}

export function obfuscateCodePreservingSourceMap(
  code: string,
  map: string | RawSourceMap | MetroRawSourceMap,
  originlFilename: string,
  originalSource: string,
  options: Obfuscator.Options,
): { code: string; map: string } {
  const obfuscationResult = Obfuscator.obfuscate(code, options)
  const obfuscationResultMap = obfuscationResult.getSourceMap()

  if (!obfuscationResultMap) {
    throw new Error(
      "javascript-obfuscator did not return a source map for file " +
        originlFilename,
    )
  }

  if (Array.isArray(map)) {
    map = convertMetroRawSourceMapToStandardSourceMap(
      map,
      originlFilename,
      originalSource,
    )
  }

  return {
    code: obfuscationResult.getObfuscatedCode(),
    map: composeSourceMaps(
      map,
      obfuscationResultMap,
      originlFilename,
      originalSource,
    ),
  }
}
