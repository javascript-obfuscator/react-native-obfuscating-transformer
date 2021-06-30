"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function extendFileExtension(filename, extensionPart) {
    var parts = filename.split(".");
    parts.splice(1, 0, extensionPart);
    return parts.join(".");
}
exports.extendFileExtension = extendFileExtension;
