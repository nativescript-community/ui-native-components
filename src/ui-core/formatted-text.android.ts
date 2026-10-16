import { FormattedString, ImageSource, TextBase, Utils } from '@nativescript/core';
import { createNativeFormattedTextCommon } from './formatted-text-common';

export function createNativeFormattedText(formatted: FormattedString, owner: TextBase): android.text.SpannableStringBuilder {
    return createNativeFormattedTextCommon(formatted, owner, Utils.layout.getDisplayDensity());
}

export function renderAttributedStringToImage(attributed: any): any {
    throw new Error('renderAttributedStringToImage is iOS only');
}

export function renderFormattedTextToImageSource(formatted: FormattedString, owner: TextBase, fontSize = 24): ImageSource {
    const text = createNativeFormattedText(formatted, owner) as any;
    if (!text) {
        return null;
    }
    const paint = new android.text.TextPaint(android.graphics.Paint.ANTI_ALIAS_FLAG);
    paint.setTextSize(Utils.layout.toDevicePixels(fontSize));
    paint.setColor(android.graphics.Color.BLACK);
    const width = Math.max(1, Math.ceil(android.text.Layout.getDesiredWidth(text, paint)));
    const layout = android.text.StaticLayout.Builder.obtain(text, 0, text.length(), paint, width).setIncludePad(false).build();
    const bitmap = android.graphics.Bitmap.createBitmap(width, Math.max(1, layout.getHeight()), android.graphics.Bitmap.Config.ARGB_8888);
    layout.draw(new android.graphics.Canvas(bitmap));
    return new ImageSource(bitmap);
}
