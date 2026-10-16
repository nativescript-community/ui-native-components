import { Background, Color, View, backgroundInternalProperty } from '@nativescript/core';

const TRANSPARENT = new Color(0, 0, 0, 0);

/**
 * Some native controls use `background-color` for one of their parts (the track of a Switch, a Slider, a Progress, the bar of a SearchBar)
 * so the core discards the whole background of the view, borders and radius included.
 * This draws the border, the radius and the shadow of the background without its color: the color keeps its meaning for the control.
 * Use it in the `[backgroundInternalProperty.setNative]` of the control.
 */
export function applyBorderBackground(view: View, value: Background) {
    const base = (View.prototype as any)[backgroundInternalProperty.setNative];
    if (!base) {
        return;
    }
    base.call(view, value ? value.withColor(TRANSPARENT) : value);
}
