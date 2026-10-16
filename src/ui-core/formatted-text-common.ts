import type { FormattedString, TextBase } from '@nativescript/core';

let textLib: any;
let textLibChecked = false;

/**
 * `@nativescript-community/text` is an optional dependency
 */
export function getTextLib(): { createNativeAttributedString?: (...args: any[]) => any } | null {
    if (!textLibChecked) {
        textLibChecked = true;
        try {
            textLib = require('@nativescript-community/text');
        } catch (error) {
            textLib = null;
        }
    }
    return textLib;
}

export function createNativeFormattedTextCommon(formatted: FormattedString, owner: TextBase, density?: number) {
    if (!formatted) {
        return null;
    }
    const lib = getTextLib();
    if (lib?.createNativeAttributedString) {
        // fontSizeRatio is iOS only, density Android only
        return lib.createNativeAttributedString(formatted, owner, owner, false, 1, density);
    }
    return (owner as any)?.createFormattedTextNative?.(formatted) ?? null;
}
