import * as crypto from "crypto"
import * as fs from "fs"

import { getCallerFile } from "./getCallerFile"
import { MetroTransformer, getMetroTransformer } from "./getMetroTransformer"

function getOwnCacheKey(upstreamCacheKey: string, callerFilename: string) {
  var key = crypto.createHash("md5")
  key.update(upstreamCacheKey)
  key.update(fs.readFileSync(__filename))
  key.update(fs.readFileSync(callerFilename))
  return key.digest("hex")
}

interface ObfuscationOptions {
  match?: RegExp
  upstreamTransformer?: MetroTransformer
}

function obfuscatingTransformer({
  match = /.*.js/,
  upstreamTransformer = getMetroTransformer(),
  ..._options
}: ObfuscationOptions): MetroTransformer {
  const callerFilename = getCallerFile()

  return {
    transform(props) {
      const result = upstreamTransformer.transform(props)
      if (props.filename.match(match)) {
        console.log("obfuscating", props.filename)
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

export = obfuscatingTransformer
