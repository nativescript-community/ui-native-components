import { FormattedString, TextBase, Utils } from '@nativescript/core';
import { createNativeFormattedTextCommon } from './formatted-text-common';

export function createNativeFormattedText(formatted: FormattedString, owner: TextBase): android.text.SpannableStringBuilder {
    return createNativeFormattedTextCommon(formatted, owner, Utils.layout.getDisplayDensity());
}

export function renderAttributedStringToImage(attributed: any): any {
    throw new Error('renderAttributedStringToImage is iOS only');
}
