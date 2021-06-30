"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getMetroTransformer_1 = require("../getMetroTransformer");
var composeSourceMaps_1 = require("../composeSourceMaps");
var fs = require("fs");
var path = require("path");
var source_map_1 = require("source-map/source-map");
var getPositionOfSubstring_1 = require("./getPositionOfSubstring");
var ts = require("typescript");
var numberedLines = fs
    .readFileSync(require.resolve("./files/numberedLines.js"))
    .toString();
describe("convertMetroRawSourceMapToStandardSourceMap", function () {
    it("takes a raw source map and converts it to a non-raw source map", function () {
        var transformer = getMetroTransformer_1.getMetroTransformer(47);
        var _a = transformer.transform({
            filename: require.resolve("./files/numberedLines.js"),
            src: numberedLines,
            options: {
                retainLines: false,
            },
        }), map = _a.map, code = _a.code;
        if (typeof code !== "string") {
            // use this rather than expect for typescript's sake
            throw new Error("code must be a string");
        }
        expect(Array.isArray(map)).toBe(true);
        expect(map).toMatchSnapshot();
        var standardMap = composeSourceMaps_1.convertMetroRawSourceMapToStandardSourceMap(map, path.join(__dirname, "numberedLines.js"), numberedLines);
        var standardMapConsumer = new source_map_1.SourceMapConsumer(standardMap); // upstream types are wrong
        for (var _i = 0, _b = ["line1", "line2", "line3", "line5"]; _i < _b.length; _i++) {
            var substring = _b[_i];
            expect(standardMapConsumer.originalPositionFor(getPositionOfSubstring_1.getPositionOfSubstring(code, substring))).toMatchObject(getPositionOfSubstring_1.getPositionOfSubstring(numberedLines, substring));
        }
        expect(standardMap).toMatchSnapshot();
    });
});
describe("composeSourceMaps", function () {
    it("composes two source maps together", function () {
        var filename = require.resolve("./files/hello.ts");
        var hello = fs.readFileSync(filename).toString();
        var tsTranspileResult = ts.transpileModule(hello, {
            fileName: filename,
            compilerOptions: {
                sourceMap: true,
                target: ts.ScriptTarget.ES2015,
            },
        });
        expect(tsTranspileResult.outputText).toMatchSnapshot();
        var upstreamTransformResult = getMetroTransformer_1.getMetroTransformer(47).transform({
            filename: filename,
            src: tsTranspileResult.outputText,
            options: {
                retainLines: false,
            },
        });
        expect(upstreamTransformResult.code).toMatchSnapshot();
        var composedMap = new source_map_1.SourceMapConsumer(composeSourceMaps_1.composeSourceMaps(tsTranspileResult.sourceMapText, composeSourceMaps_1.convertMetroRawSourceMapToStandardSourceMap(upstreamTransformResult.map, filename, hello), filename, hello)); // upstream types are wrong
        expect(composedMap.originalPositionFor(getPositionOfSubstring_1.getPositionOfSubstring(upstreamTransformResult.code, "line6"))).toMatchObject({ line: 6 });
        expect(composedMap.originalPositionFor(getPositionOfSubstring_1.getPositionOfSubstring(upstreamTransformResult.code, "line8"))).toMatchObject({ line: 8 });
    });
});
