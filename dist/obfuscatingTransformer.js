"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
var app_root_path_1 = require("app-root-path");
var babel_generator_1 = require("babel-generator");
var getCallerFile_1 = require("./getCallerFile");
var getMetroTransformer_1 = require("./getMetroTransformer");
var obfuscateCode_1 = require("./obfuscateCode");
var extendFileExtension_1 = require("./extendFileExtension");
function getOwnCacheKey(upstreamCacheKey, configFilename) {
    var key = crypto.createHash("md5");
    key.update(upstreamCacheKey);
    key.update(fs.readFileSync(__filename));
    key.update(fs.readFileSync(configFilename));
    return key.digest("hex");
}
var sourceDir = path.join(app_root_path_1.path, "src");
function obfuscatingTransformer(_a) {
    var _b = _a.filter, filter = _b === void 0 ? function (filename) { return filename.startsWith(sourceDir); } : _b, _c = _a.upstreamTransformer, upstreamTransformer = _c === void 0 ? getMetroTransformer_1.getMetroTransformer() : _c, _obfuscatorOptions = _a.obfuscatorOptions, otherOptions = __rest(_a, ["filter", "upstreamTransformer", "obfuscatorOptions"]);
    var callerFilename = getCallerFile_1.getCallerFile();
    var obfuscatorOptions = __assign({}, _obfuscatorOptions, { sourceMap: true, sourceMapMode: "separate", stringArray: false });
    return {
        transform: function (props) {
            var result = upstreamTransformer.transform(props);
            if (props.options.dev && !otherOptions.enableInDevelopment) {
                return result;
            }
            var resultCanBeObfuscated = result.code || result.ast;
            if (resultCanBeObfuscated && filter(props.filename, props.src)) {
                if (otherOptions.trace) {
                    console.log("Obfuscating", props.filename);
                }
                var _a = result.code
                    ? result
                    : result.ast
                        ? babel_generator_1.default(result.ast, {
                            filename: props.filename,
                            retainLines: true,
                            sourceMaps: true,
                            sourceFileName: props.filename,
                        })
                        : { code: "", map: "" }, code = _a.code, map = _a.map;
                if (!code) {
                    return result;
                }
                else if (!map) {
                    return {
                        code: obfuscateCode_1.obfuscateCode(code, obfuscatorOptions),
                    };
                }
                if (otherOptions.emitObfuscatedFiles) {
                    var emitDir = path.dirname(props.filename);
                    var filename = extendFileExtension_1.extendFileExtension(path.basename(props.filename), "obfuscated");
                    fs.writeFileSync(path.join(emitDir, filename), code);
                }
                return getMetroTransformer_1.maybeTransformMetroResult(result, obfuscateCode_1.obfuscateCodePreservingSourceMap(code, map, props.filename, props.src, obfuscatorOptions));
            }
            return result;
        },
        getCacheKey: function () {
            return getOwnCacheKey(upstreamTransformer.getCacheKey
                ? upstreamTransformer.getCacheKey()
                : "", callerFilename);
        },
    };
}
exports.obfuscatingTransformer = obfuscatingTransformer;
