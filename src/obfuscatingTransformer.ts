import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"
import * as JavaScriptObfuscator from "javascript-obfuscator"
import { path as appRootPath } from "app-root-path"

import { getCallerFile } from "./getCallerFile"
import {
  MetroTransformer,
  generateAndConvert,
  getMetroTransformer,
  MetroTransformerResult,
  maybeTransformMetroResult,
} from "./getMetroTransformer"
import {
  obfuscateCode,
  obfuscateCodePreservingSourceMap,
} from "./obfuscateCode"
import { extendFileExtension } from "./extendFileExtension"

function getOwnCacheKey(upstreamCacheKey: string, configFilename: string) {
  var key = crypto.createHash("md5")
  key.update(upstreamCacheKey)
  key.update(fs.readFileSync(__filename))
  key.update(fs.readFileSync(configFilename))
  return key.digest("hex")
}

export interface ObfuscatingTransformerOptions {
  filter?(filename: string, source: string): boolean
  upstreamTransformer?: MetroTransformer
  obfuscatorOptions?: JavaScriptObfuscator.Options
  trace?: boolean
  emitObfuscatedFiles?: boolean
  enableInDevelopment?: boolean
}

const sourceDir = path.join(appRootPath, "src")

export function obfuscatingTransformer({
  filter = filename => filename.startsWith(sourceDir),
  upstreamTransformer = getMetroTransformer(),
  obfuscatorOptions: _obfuscatorOptions,
  ...otherOptions
}: ObfuscatingTransformerOptions): MetroTransformer {
  const callerFilename = getCallerFile()

  const obfuscatorOptions: JavaScriptObfuscator.Options = {
    ..._obfuscatorOptions,
    sourceMap: true,
    sourceMapMode: "separate",
    stringArray: false,
  }

  return {
    transform(props) {
      const result = upstreamTransformer.transform(props)

      if (props.options.dev && !otherOptions.enableInDevelopment) {
        return result
      }

      const resultCanBeObfuscated = result.code || result.ast

      if (resultCanBeObfuscated && filter(props.filename, props.src)) {
        if (otherOptions.trace) {
          console.log("Obfuscating", props.filename)
        }

        const { code, map }: MetroTransformerResult = result.code
          ? result
          : result.ast
            ? generateAndConvert(result.ast, props.filename)
            : { code: "", map: "" }

        if (!code) {
          return result
        } else if (!map) {
          return {
            code: obfuscateCode(code, obfuscatorOptions),
          }
        }

        if (otherOptions.emitObfuscatedFiles) {
          const emitDir = path.dirname(props.filename)
          const filename = extendFileExtension(
            path.basename(props.filename),
            "obfuscated",
          )
          fs.writeFileSync(path.join(emitDir, filename), code)
        }

        return maybeTransformMetroResult(
          result,
          obfuscateCodePreservingSourceMap(
            code,
            map,
            props.filename,
            props.src,
            obfuscatorOptions,
          ),
        )
      }

      return result
    },

    getCacheKey() {
      return getOwnCacheKey(
        upstreamTransformer.getCacheKey
          ? upstreamTransformer.getCacheKey()
          : "",
        callerFilename,
      )
    },
  }
}
