import { Color, Utils } from '@nativescript/core';
import { LiquidGlass } from '@nativescript/core/ui/layouts/liquid-glass';
import { supportsGlass } from '@nativescript/core/utils/constants';
import { SurfaceVariant, interactiveProperty, tintProperty, variantProperty } from './index-common';
export * from './index-common';

/**
 * iOS: the Liquid Glass layout of core (iOS 26+) with a variant and a capsule shape. Before iOS 26 the glass is a system blur.
 */
export class Surface extends LiquidGlass {
    variant: SurfaceVariant;
    interactive: boolean;
    tint: Color;

    nativeViewProtected: UIVisualEffectView;

    public createNativeView() {
        const view = super.createNativeView() as UIVisualEffectView;
        this.mEffectView = view;
        this.updateEffect();
        return view;
    }
    private mEffectView: UIVisualEffectView;

    private updateEffect() {
        const view = this.mEffectView;
        if (!view) {
            return;
        }
        let effect: UIVisualEffect;
        if (supportsGlass()) {
            const glass = (global as any).UIGlassEffect.effectWithStyle(this.variant === 'clear' ? 1 : 0);
            glass.interactive = !!this.interactive;
            if (this.tint) {
                glass.tintColor = this.tint.ios;
            }
            effect = glass;
        } else {
            effect = UIBlurEffect.effectWithStyle(this.variant === 'clear' ? UIBlurEffectStyle.SystemUltraThinMaterial : UIBlurEffectStyle.SystemThinMaterial);
        }
        view.effect = effect;
    }

    // The core LiquidGlass measures its content without the padding, but lays it out with the padding: the content overflows
    // the surface (icons seem to be shifted down). The padding is taken from the available space and added back to the size.
    onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const horizontal = this.effectivePaddingLeft + this.effectivePaddingRight + this.effectiveBorderLeftWidth + this.effectiveBorderRightWidth;
        const vertical = this.effectivePaddingTop + this.effectivePaddingBottom + this.effectiveBorderTopWidth + this.effectiveBorderBottomWidth;
        const reduce = (spec: number, amount: number) => {
            const mode = Utils.layout.getMeasureSpecMode(spec);
            return mode === Utils.layout.UNSPECIFIED ? spec : Utils.layout.makeMeasureSpec(Math.max(0, Utils.layout.getMeasureSpecSize(spec) - amount), mode);
        };
        super.onMeasure(reduce(widthMeasureSpec, horizontal), reduce(heightMeasureSpec, vertical));
        this.setMeasuredDimension(this.getMeasuredWidth() + horizontal, this.getMeasuredHeight() + vertical);
    }

    // the capsule shape, unless the style has a border-radius
    onLayout(left: number, top: number, right: number, bottom: number): void {
        super.onLayout(left, top, right, bottom);
        const view = this.nativeViewProtected;
        if (view && !this.borderRadius) {
            const height = Utils.layout.toDeviceIndependentPixels(bottom - top);
            view.layer.cornerRadius = height / 2;
            view.layer.cornerCurve = 'continuous';
        }
    }

    [variantProperty.setNative](value: SurfaceVariant) {
        this.updateEffect();
    }
    [interactiveProperty.setNative](value: boolean) {
        this.updateEffect();
    }
    [tintProperty.setNative](value: Color) {
        this.updateEffect();
    }
}
variantProperty.register(Surface);
interactiveProperty.register(Surface);
tintProperty.register(Surface);
