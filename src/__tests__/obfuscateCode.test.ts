import * as fs from "fs"

jest.mock("javascript-obfuscator", () => ({
  obfuscate() {
    return {
      getObfuscatedCode() {
        return "this code is obfuscated"
      },
      getSourceMap() {
        return ""
      },
    }
  },
}))

import { obfuscateCode } from "../obfuscateCode"

describe("obfuscateCode", () => {
  it("obfuscates code", () => {
    const filename = require.resolve("./files/es5.js")
    const es5code = fs.readFileSync(filename).toString()
    expect(obfuscateCode(es5code, {})).toBe("this code is obfuscated")
  })
})
