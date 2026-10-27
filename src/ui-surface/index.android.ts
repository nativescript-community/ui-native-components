import { Background, Color, GridLayout, Utils, backgroundColorProperty, backgroundInternalProperty } from '@nativescript/core';
import { SurfaceVariant, interactiveProperty, tintProperty, variantProperty } from './index-common';
export * from './index-common';

const ELEVATION_DP = 6;

// the R classes are not in the metadata of the apps: the attribute is found by name
function themeColor(context: android.content.Context, attrName: string, fallback: number) {
    const attr = context.getResources().getIdentifier(attrName, 'attr', context.getPackageName());
    const value = new android.util.TypedValue();
    return attr && context.getTheme().resolveAttribute(attr, value, true) ? value.data : fallback;
}

/**
 * Android: a Material 3 surface: the surface container color, a capsule shape and the elevation of the floating toolbars.
 */
export class Surface extends GridLayout {
    variant: SurfaceVariant;
    interactive: boolean;
    tint: Color;

    private mUserColor: Color;
    private mUserBackground: Background;

    public initNativeView(): void {
        super.initNativeView();
        this.updateLook();
    }

    private updateLook() {
        const view = this.nativeViewProtected as android.view.ViewGroup;
        if (!view) {
            return;
        }
        const context = view.getContext();
        const dp = (value: number) => Utils.layout.toDevicePixels(value);
        const clear = this.variant === 'clear';
        const user = this.mUserBackground;
        const background = new android.graphics.drawable.GradientDrawable();
        // a radius larger than the half of the height gives the capsule
        background.setCornerRadius(user?.borderTopLeftRadius ? dp(user.borderTopLeftRadius) : dp(1000));
        if (this.mUserColor) {
            background.setColor(this.mUserColor.android);
        } else {
            background.setColor(clear ? android.graphics.Color.TRANSPARENT : themeColor(context, 'colorSurfaceContainer', android.graphics.Color.WHITE));
        }
        if (user?.borderTopWidth) {
            background.setStroke(dp(user.borderTopWidth), user.borderTopColor ? user.borderTopColor.android : android.graphics.Color.GRAY);
        } else if (clear) {
            background.setStroke(dp(1), themeColor(context, 'colorOutlineVariant', android.graphics.Color.GRAY));
        }
        view.setBackground(background);
        // the children follow the shape, the shadow follows the background
        view.setClipToOutline(true);
        view.setElevation(clear ? 0 : dp(ELEVATION_DP));
    }

    [variantProperty.setNative](value: SurfaceVariant) {
        this.updateLook();
    }
    [interactiveProperty.setNative](value: boolean) {}
    [tintProperty.setNative](value: Color) {}
    [backgroundColorProperty.setNative](value: Color) {
        this.mUserColor = value instanceof Color ? value : value ? new Color(value as any) : null;
        this.updateLook();
    }
    // border and radius of the view are drawn with the shape of the surface
    [backgroundInternalProperty.setNative](value: Background) {
        this.mUserBackground = value;
        this.updateLook();
    }
}
variantProperty.register(Surface);
interactiveProperty.register(Surface);
tintProperty.register(Surface);
