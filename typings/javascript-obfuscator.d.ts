declare module "javascript-obfuscator" {
  namespace JavaScriptObfuscator {
    interface Options {
      compact?: boolean
      controlFlowFlattening?: boolean
      controlFlowFlatteningThreshold?: 0.75
      deadCodeInjection?: boolean
      deadCodeInjectionThreshold?: 0.4
      debugProtection?: boolean
      debugProtectionInterval?: boolean
      disableConsoleOutput?: boolean
      domainLock?: string[]
      identifierNamesGenerator?: "hexadecimal" | "mangled"
      log?: boolean
      renameGlobals?: boolean
      reservedNames?: string[]
      rotateStringArray?: true
      seed?: 0
      selfDefending?: boolean
      sourceMap?: boolean
      sourceMapBaseUrl?: string
      sourceMapFileName?: string
      sourceMapMode?: "separate" | "inline"
      stringArray?: boolean
      stringArrayEncoding?: boolean
      stringArrayThreshold?: 0.75
      target?: "browser" | "extension" | "node"
      unicodeEscapeSequence?: boolean
    }

    function obfuscate(
      sourceCode: string,
      options: Options,
    ): {
      getObfuscatedCode(): string
      getSourceMap(): string | null
    }
  }

  export = JavaScriptObfuscator
}
