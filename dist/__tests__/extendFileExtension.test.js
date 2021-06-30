"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extendFileExtension_1 = require("../extendFileExtension");
describe("extendFileExtension", function () {
    it("adds an extension part", function () {
        expect(extendFileExtension_1.extendFileExtension("blah.js", "ext")).toBe("blah.ext.js");
        expect(extendFileExtension_1.extendFileExtension("blah.tsx", "obfuscated")).toBe("blah.obfuscated.tsx");
        expect(extendFileExtension_1.extendFileExtension("blah", "js")).toBe("blah.js");
    });
});
