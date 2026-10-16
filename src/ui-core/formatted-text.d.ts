import { FormattedString, TextBase } from '@nativescript/core';

/**
 * Creates the native rich text of a FormattedString (spans): a SpannableStringBuilder on Android, a NSAttributedString on iOS.
 * `@nativescript-community/text` is used when it is installed (optional), else the conversion of the core `owner` label.
 * @param owner a label (core or `@nativescript-community/ui-label`) used for the default font and color
 */
export function createNativeFormattedText(formatted: FormattedString, owner: TextBase): any;

/**
 * iOS only: draws a NSAttributedString into a (non template) UIImage.
 * Needed by the controls which can only show plain titles (UISegmentedControl).
 * The text without color uses the label color.
 */
export function renderAttributedStringToImage(attributed: any): any;
