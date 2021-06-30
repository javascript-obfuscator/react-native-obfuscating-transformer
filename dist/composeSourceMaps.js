"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var source_map_1 = require("source-map");
function convertMetroRawSourceMapToStandardSourceMap(map, originalFileName, originalFileContent) {
    var outputMap = new source_map_1.SourceMapGenerator();
    outputMap.setSourceContent(originalFileName, originalFileContent);
    map.forEach(function (args) {
        var generatedLine = args[0], generatedColumn = args[1], originalLine = args[2], originalColumn = args[3];
        outputMap.addMapping({
            generated: {
                line: generatedLine,
                column: generatedColumn,
            },
            original: {
                line: originalLine,
                column: originalColumn,
            },
            source: originalFileName,
            name: args.length === 5 ? args[4] : undefined,
        });
    });
    return outputMap.toString();
}
exports.convertMetroRawSourceMapToStandardSourceMap = convertMetroRawSourceMapToStandardSourceMap;
function convertStandardSourceMapToMetroRawSourceMap(map) {
    var consumer = new source_map_1.SourceMapConsumer(map); // upstream types are wrong
    var outputMap = [];
    consumer.eachMapping(function (mapping) {
        outputMap.push([
            mapping.generatedLine,
            mapping.generatedColumn,
            mapping.originalLine,
            mapping.originalColumn,
            mapping.name,
        ]);
    });
    return outputMap;
}
exports.convertStandardSourceMapToMetroRawSourceMap = convertStandardSourceMapToMetroRawSourceMap;
function composeSourceMaps(sourceMap, targetMap, sourceFileName, sourceContent) {
    var tsConsumer = new source_map_1.SourceMapConsumer(sourceMap); // upstreeam types are wrong
    var babelConsumer = new source_map_1.SourceMapConsumer(targetMap);
    var map = new source_map_1.SourceMapGenerator();
    map.setSourceContent(sourceFileName, sourceContent);
    babelConsumer.eachMapping(function (_a) {
        var generatedLine = _a.generatedLine, generatedColumn = _a.generatedColumn, originalLine = _a.originalLine, originalColumn = _a.originalColumn, name = _a.name;
        if (originalLine) {
            var original = tsConsumer.originalPositionFor({
                line: originalLine,
                column: originalColumn,
            });
            if (original.line) {
                map.addMapping({
                    generated: {
                        line: generatedLine,
                        column: generatedColumn,
                    },
                    original: {
                        line: original.line,
                        column: original.column,
                    },
                    source: sourceFileName,
                    name: name,
                });
            }
        }
    });
    return map.toString();
}
exports.composeSourceMaps = composeSourceMaps;
