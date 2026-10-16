import { Color, colorProperty } from '@nativescript/core';
import { valueProperty } from '@nativescript/core/ui/slider/slider-common';
import { SliderBase } from './slider-common';
import { stepSizeProperty, thumbColorProperty, trackBackgroundColorProperty, trackFillColorProperty } from './cssproperties';

@NativeClass
class SliderStepHandlerImpl extends NSObject {
    _owner: WeakRef<Slider>;
    static initWithOwner(owner: WeakRef<Slider>) {
        const handler = SliderStepHandlerImpl.new() as SliderStepHandlerImpl;
        handler._owner = owner;
        return handler;
    }
    sliderValueChanged(sender: UISlider) {
        const owner = this._owner?.deref();
        if (owner) {
            const value = owner.snap(sender.value);
            if (value !== sender.value) {
                sender.value = value;
            }
            valueProperty.nativeValueChange(owner, value);
        }
    }
    static ObjCExposedMethods = {
        sliderValueChanged: { returns: interop.types.void, params: [UISlider] }
    };
}

/**
 * iOS: native UISlider.
 * `trackFillColor`, `trackBackgroundColor` and `thumbColor` map to the UISlider tints.
 * `stepSize` snaps the value.
 */
export class Slider extends SliderBase {
    nativeViewProtected: UISlider;

    private mStepHandler: SliderStepHandlerImpl;
    initNativeView() {
        super.initNativeView();
        // the core change handler reports the raw native value: replace it so that stepSize is applied first
        const nativeView = this.nativeViewProtected;
        const coreHandler = (this as any)._changeHandler;
        if (coreHandler) {
            nativeView.removeTargetActionForControlEvents(coreHandler, 'sliderValueChanged', UIControlEvents.ValueChanged);
        }
        this.mStepHandler = SliderStepHandlerImpl.initWithOwner(new WeakRef(this));
        nativeView.addTargetActionForControlEvents(this.mStepHandler, 'sliderValueChanged', UIControlEvents.ValueChanged);
    }
    disposeNativeView() {
        this.mStepHandler = null;
        super.disposeNativeView();
    }

    snap(value: number) {
        const step = this.stepSize;
        if (!step || step <= 0) {
            return value;
        }
        const min = this.minValue || 0;
        return Math.min(this.maxValue, min + Math.round((value - min) / step) * step);
    }

    [stepSizeProperty.setNative](value: number) {
        if (value && this.nativeViewProtected) {
            const snapped = this.snap(this.nativeViewProtected.value);
            if (snapped !== this.nativeViewProtected.value) {
                this.nativeViewProtected.value = snapped;
                this.value = snapped;
            }
        }
    }

    [colorProperty.setNative](color: Color) {
        // same behavior as the Material version: color is used for the thumb and the filled track
        if (!this.trackFillColor) {
            this.nativeViewProtected.minimumTrackTintColor = color ? color.ios : null;
        }
        if (!this.thumbColor) {
            this.nativeViewProtected.thumbTintColor = color ? color.ios : null;
        }
    }
    [thumbColorProperty.setNative](color: Color) {
        this.nativeViewProtected.thumbTintColor = color ? color.ios : null;
    }
    [trackFillColorProperty.setNative](color: Color) {
        this.nativeViewProtected.minimumTrackTintColor = color ? color.ios : null;
    }
    [trackBackgroundColorProperty.setNative](color: Color) {
        this.nativeViewProtected.maximumTrackTintColor = color ? color.ios : null;
    }
}
