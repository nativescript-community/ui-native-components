import { Background } from '@nativescript/core';
import { CardBase, CardVariant, variantProperty } from './index-common';
export * from './index-common';

const DEFAULT_RADIUS = 16;

/**
 * iOS: a grouped, rounded surface (the inset grouped list look). No elevation and no glass: Liquid Glass is for the controls layer.
 */
export class Card extends CardBase {
    nativeViewProtected: UIView;

    public createNativeView() {
        const view = UIView.new();
        view.clipsToBounds = true;
        return view;
    }

    public initNativeView(): void {
        super.initNativeView();
        this.updateLook();
    }

    private updateLook(userBackground?: Background) {
        const view = this.nativeViewProtected;
        if (!view) {
            return;
        }
        const variant = this.variant;
        const layer = view.layer;
        // the variant look, replaced by the style of the view
        if (!userBackground?.color) {
            view.backgroundColor = variant === 'filled' ? UIColor.secondarySystemFillColor : variant === 'outlined' ? UIColor.systemBackgroundColor : UIColor.secondarySystemBackgroundColor;
        }
        if (!userBackground?.borderTopWidth) {
            layer.borderWidth = variant === 'outlined' ? 1 : 0;
            layer.borderColor = UIColor.separatorColor.CGColor;
        }
        if (!userBackground?.borderTopLeftRadius) {
            layer.cornerRadius = DEFAULT_RADIUS;
            layer.cornerCurve = 'continuous';
        }
    }

    // the core redraws the background (color, border, radius) on layout: the defaults of the variant come back for what the style does not set
    _redrawNativeBackground(value: any) {
        super['_redrawNativeBackground'](value);
        this.updateLook(value instanceof Object && !('CGColor' in value) ? (value as Background) : undefined);
    }

    [variantProperty.setNative](value: CardVariant) {
        this.updateLook(this.style.backgroundInternal);
    }
}
