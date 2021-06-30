import { Node } from "babel-core";
import { RawSourceMap } from "source-map";
import { MetroRawSourceMap } from "./composeSourceMaps";
export interface MetroTransformerResult {
    ast?: Node;
    code?: string;
    map?: string | RawSourceMap | MetroRawSourceMap;
}
export interface MetroTransformer {
    transform(props: {
        filename: string;
        src: string;
        options: {
            dev?: boolean;
            retainLines?: boolean;
        };
    }): MetroTransformerResult;
    getCacheKey?(): string;
}
export declare function getMetroTransformer(reactNativeMinorVersion?: number): MetroTransformer;
export interface ReactNativeObfuscatingTransformerDefaultResult {
    code: string;
    map: string;
}
export declare function maybeTransformMetroResult(upstreamResult: MetroTransformerResult, { code, map }: ReactNativeObfuscatingTransformerDefaultResult, reactNativeMinorVersion?: number): MetroTransformerResult;
