import * as Obfuscator from "javascript-obfuscator";
import { MetroRawSourceMap } from "./composeSourceMaps";
import { RawSourceMap } from "source-map/source-map";
export declare function obfuscateCode(code: string, options: Obfuscator.Options): string;
export declare function obfuscateCodePreservingSourceMap(code: string, map: string | RawSourceMap | MetroRawSourceMap, originlFilename: string, originalSource: string, options: Obfuscator.Options): {
    code: string;
    map: string;
};
