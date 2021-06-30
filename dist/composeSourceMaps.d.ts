import { RawSourceMap } from "source-map";
export declare type MetroRawSourceMap = Array<[number, number, number, number, string | undefined]>;
export declare function convertMetroRawSourceMapToStandardSourceMap(map: MetroRawSourceMap, originalFileName: string, originalFileContent: string): string;
export declare function convertStandardSourceMapToMetroRawSourceMap(map: RawSourceMap | string): [number, number, number, number, string | undefined][];
export declare function composeSourceMaps(sourceMap: string | RawSourceMap, targetMap: string | RawSourceMap, sourceFileName: string, sourceContent: string): string;
