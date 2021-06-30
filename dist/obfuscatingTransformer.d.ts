import * as JavaScriptObfuscator from "javascript-obfuscator";
import { MetroTransformer } from "./getMetroTransformer";
export interface ObfuscatingTransformerOptions {
    filter?(filename: string, source: string): boolean;
    upstreamTransformer?: MetroTransformer;
    obfuscatorOptions?: JavaScriptObfuscator.Options;
    trace?: boolean;
    emitObfuscatedFiles?: boolean;
    enableInDevelopment?: boolean;
}
export declare function obfuscatingTransformer({ filter, upstreamTransformer, obfuscatorOptions: _obfuscatorOptions, ...otherOptions }: ObfuscatingTransformerOptions): MetroTransformer;
