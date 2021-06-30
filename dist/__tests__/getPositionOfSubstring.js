"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getPositionOfSubstring(text, substring) {
    var lines = text.split(/\r?\n/);
    for (var line = 0; line < lines.length; line++) {
        var column = lines[line].indexOf(substring);
        if (column >= 0) {
            return { line: line + 1, column: column };
        }
    }
    return null;
}
exports.getPositionOfSubstring = getPositionOfSubstring;
