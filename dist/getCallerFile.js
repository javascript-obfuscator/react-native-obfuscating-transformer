"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This code taken from https://stackoverflow.com/a/29581862/1382997
// Question by einstein https://stackoverflow.com/users/449132/einstein
// Answer by Rhionin https://stackoverflow.com/users/1751376/rhionin
function getCallerFile() {
    var originalFunc = Error.prepareStackTrace;
    var callerfile;
    try {
        var err = new Error();
        var currentfile;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        currentfile = err.stack.shift().getFileName();
        // go up two places in the stack trace. i.e. out of this file, and out of index.ts
        for (var i = 0; i < 2; i++) {
            while (err.stack.length) {
                callerfile = err.stack.shift().getFileName();
                if (currentfile !== callerfile)
                    break;
            }
            currentfile = callerfile;
        }
    }
    catch (e) { }
    Error.prepareStackTrace = originalFunc;
    return callerfile;
}
exports.getCallerFile = getCallerFile;
