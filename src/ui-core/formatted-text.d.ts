import { FormattedString, ImageSource, TextBase } from '@nativescript/core';

/**
 * Creates the native rich text of a FormattedString (spans): a SpannableStringBuilder on Android, a NSAttributedString on iOS.
 * `@nativescript-community/text` is used when it is installed (optional), else the conversion of the core `owner` label.
 * @param owner a label (core or `@nativescript-community/ui-label`) used for the default font and color, a new Label by default
 */
export function createNativeFormattedText(formatted: FormattedString, owner?: TextBase): any;

/**
 * iOS only: draws a NSAttributedString into a (non template) UIImage.
 * Needed by the controls which can only show plain titles (UISegmentedControl).
 * The text without color uses the label color.
 */
export function renderAttributedStringToImage(attributed: any): any;

/**
 * Draws a FormattedString (spans) into an image: custom icons from font icons, emojis, styled text...
 * The colors of the spans are kept, the text without color is black on Android and the label color on iOS.
 * @param owner a label used for the default font
 * @param fontSize default size of the text without size, in dip (24 by default, the size of the icons)
 */
export function renderFormattedTextToImageSource(formatted: FormattedString, owner: TextBase, fontSize?: number): ImageSource;
