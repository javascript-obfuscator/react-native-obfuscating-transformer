"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
jest.mock("javascript-obfuscator", function () { return ({
    obfuscate: function () {
        return {
            getObfuscatedCode: function () {
                return "this code is obfuscated";
            },
            getSourceMap: function () {
                return "";
            },
        };
    },
}); });
var obfuscateCode_1 = require("../obfuscateCode");
describe("obfuscateCode", function () {
    it("obfuscates code", function () {
        var filename = require.resolve("./files/es5.js");
        var es5code = fs.readFileSync(filename).toString();
        expect(obfuscateCode_1.obfuscateCode(es5code, {})).toBe("this code is obfuscated");
    });
});
