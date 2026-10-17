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
