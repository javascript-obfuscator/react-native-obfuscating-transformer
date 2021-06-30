"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Obfuscator = require("javascript-obfuscator");
var composeSourceMaps_1 = require("./composeSourceMaps");
function obfuscateCode(code, options) {
    return Obfuscator.obfuscate(code, options).getObfuscatedCode();
}
exports.obfuscateCode = obfuscateCode;
function obfuscateCodePreservingSourceMap(code, map, originlFilename, originalSource, options) {
    var obfuscationResult = Obfuscator.obfuscate(code, options);
    var obfuscationResultMap = obfuscationResult.getSourceMap();
    if (!obfuscationResultMap) {
        throw new Error("javascript-obfuscator did not return a source map for file " +
            originlFilename);
    }
    if (Array.isArray(map)) {
        map = composeSourceMaps_1.convertMetroRawSourceMapToStandardSourceMap(map, originlFilename, originalSource);
    }
    return {
        code: obfuscationResult.getObfuscatedCode(),
        map: composeSourceMaps_1.composeSourceMaps(map, obfuscationResultMap, originlFilename, originalSource),
    };
}
exports.obfuscateCodePreservingSourceMap = obfuscateCodePreservingSourceMap;
