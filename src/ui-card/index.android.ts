import { Background, Color, Length, Utils, backgroundColorProperty, backgroundInternalProperty } from '@nativescript/core';
import { elevationProperty, shapeProperty, themer } from '@nativescript-community/ui-core';
import { CardBase, CardVariant, variantProperty } from './index-common';
export * from './index-common';

// the R classes are blacklisted from the native metadata and stripped by R8 in some apps: look the ids up by name
function getAttr(name: string): number {
    return Utils.android.resources.getId(':attr/' + name);
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
    private mUserElevation: number;
    private mShape: string;
    private mDefaultAppearanceModel: com.google.android.material.shape.ShapeAppearanceModel;

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
        let strokeColor = themeColor(context, getAttr('colorOutlineVariant'), android.graphics.Color.LTGRAY);
        let elevation = 0;
        if (variant === 'filled') {
            color = themeColor(context, getAttr('colorSurfaceContainerHighest'), android.graphics.Color.LTGRAY);
        } else if (variant === 'outlined') {
            color = themeColor(context, getAttr('colorSurface'), android.graphics.Color.WHITE);
            strokeWidth = dp(1);
        } else {
            color = themeColor(context, getAttr('colorSurfaceContainerLow'), android.graphics.Color.WHITE);
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
        // the elevation of the style (elevation: 0 for a flat card) wins over the one of the variant
        card.setCardElevation(this.mUserElevation ?? elevation);
        // the radius would replace the shape
        if (!this.mShape) {
            card.setRadius(user?.borderTopLeftRadius ? dp(user.borderTopLeftRadius) : dp(12));
        }
    }

    [shapeProperty.setNative](shape: any) {
        this.mShape = shape;
        const card = this.nativeViewProtected;
        if (!shape) {
            if (this.mDefaultAppearanceModel) {
                card.setShapeAppearanceModel(this.mDefaultAppearanceModel);
            }
        } else {
            this.mDefaultAppearanceModel ??= card.getShapeAppearanceModel();
            card.setShapeAppearanceModel(themer.getShape(shape));
        }
    }
    [elevationProperty.setNative](value: any) {
        this.mUserElevation = value === undefined || value === null ? undefined : Length.toDevicePixels(typeof value === 'string' ? Length.parse(value) : value, 0);
        this.updateLook();
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
