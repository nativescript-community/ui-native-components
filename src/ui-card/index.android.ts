import { Background, Color, Utils, backgroundColorProperty, backgroundInternalProperty } from '@nativescript/core';
import { CardBase, CardVariant, variantProperty } from './index-common';
export * from './index-common';

// R is blacklisted from the native metadata of some apps: read the attribute ids with reflection
function getAttr(rClass: string, field: string): number {
    return +java.lang.Class.forName(rClass + '$attr')
        .getDeclaredField(field)
        .get(null);
}

function themeColor(context: android.content.Context, attr: number, fallback: number) {
    const value = new android.util.TypedValue();
    return context.getTheme().resolveAttribute(attr, value, true) ? value.data : fallback;
}

/**
 * Android: MaterialCardView, with the elevated, filled and outlined Material 3 looks.
 */
export class Card extends CardBase {
    nativeViewProtected: com.google.android.material.card.MaterialCardView;
    private mUserColor: Color;
    private mUserBackground: Background;

    public createNativeView() {
        return new com.google.android.material.card.MaterialCardView(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        // a clickable card shows the ripple
        this.nativeViewProtected.setClickable(true);
        this.updateLook();
    }

    /**
     * Variant colors and strokes, replaced by the background-color and the border of the view
     */
    private updateLook() {
        const card = this.nativeViewProtected;
        if (!card) {
            return;
        }
        const context = card.getContext();
        const variant = this.variant;
        const dp = (value: number) => Utils.layout.toDevicePixels(value);
        let color: number;
        let strokeWidth = 0;
        let strokeColor = themeColor(context, getAttr('com.google.android.material.R', 'colorOutlineVariant'), android.graphics.Color.LTGRAY);
        let elevation = 0;
        if (variant === 'filled') {
            color = themeColor(context, getAttr('com.google.android.material.R', 'colorSurfaceContainerHighest'), android.graphics.Color.LTGRAY);
        } else if (variant === 'outlined') {
            color = themeColor(context, getAttr('com.google.android.material.R', 'colorSurface'), android.graphics.Color.WHITE);
            strokeWidth = dp(1);
        } else {
            color = themeColor(context, getAttr('com.google.android.material.R', 'colorSurfaceContainerLow'), android.graphics.Color.WHITE);
            elevation = dp(1);
        }
        const user = this.mUserBackground;
        if (this.mUserColor) {
            color = this.mUserColor.android;
        }
        if (user?.borderTopWidth) {
            strokeWidth = dp(user.borderTopWidth);
            strokeColor = user.borderTopColor ? user.borderTopColor.android : strokeColor;
        }
        card.setCardBackgroundColor(color);
        card.setStrokeWidth(strokeWidth);
        card.setStrokeColor(strokeColor);
        card.setCardElevation(elevation);
        card.setRadius(user?.borderTopLeftRadius ? dp(user.borderTopLeftRadius) : dp(12));
    }

    [variantProperty.setNative](value: CardVariant) {
        this.updateLook();
    }
    [backgroundColorProperty.setNative](value: Color) {
        this.mUserColor = value instanceof Color ? value : value ? new Color(value as any) : null;
        this.updateLook();
    }
    // the MaterialCardView draws its own background: the border and the radius of the view are mapped to it
    [backgroundInternalProperty.setNative](value: Background) {
        this.mUserBackground = value;
        this.updateLook();
    }
}
