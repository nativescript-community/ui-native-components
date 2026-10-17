import { Color, Length, Utils, PercentLength, backgroundColorProperty, backgroundInternalProperty, colorProperty, heightProperty, visibilityProperty } from '@nativescript/core';
import { ProgressBase, busyProperty, indeterminateProperty, progressBackgroundColorProperty, progressColorProperty, trackCornerRadiusProperty, wavyProperty } from './index-common';
import { getRippleColor } from '@nativescript-community/ui-core';
import { inflateLayout } from '@nativescript-community/ui-core/android/utils';

import { applyBorderBackground } from '@nativescript-community/ui-core/border-background';

export class Progress extends ProgressBase {
    //TODO: remove as it needs to be added after TS 5.7 change https://github.com/microsoft/TypeScript/pull/59860
    [key: symbol]: (...args: any[]) => any | void;
    
    nativeViewProtected: com.google.android.material.progressindicator.LinearProgressIndicator;

    createNativeView() {
        return inflateLayout(this._context, 'ns_material_linear_progress') as com.google.android.material.progressindicator.LinearProgressIndicator;
    }

    [wavyProperty.setNative](value: boolean) {
        // the wave APIs are new in Material 1.14: not in the typings
        const indicator = this.nativeViewProtected as any;
        const px = (dip: number) => Math.round(Utils.layout.toDevicePixels(dip));
        // the values of the Widget.Material3Expressive.LinearProgressIndicator.Wavy style
        indicator.setWaveAmplitude(value ? px(3) : 0);
        indicator.setWavelengthDeterminate(value ? px(40) : 0);
        indicator.setWavelengthIndeterminate(value ? px(20) : 0);
    }

    [progressColorProperty.setNative](color: Color) {
        // the Material 3 indicators are colored with their own indicator and track colors (the tint lists of the ProgressBar are not used)
        if (color) {
            const array = Array.create('int', 1);
            array[0] = color.android;
            this.nativeViewProtected.setIndicatorColor(array);
        }
    }
    [progressBackgroundColorProperty.setNative](color: Color) {
        if (color) {
            this.nativeViewProtected.setTrackColor(color.android);
        }
    }
    [indeterminateProperty.setNative](value: boolean) {
        this.nativeViewProtected.setIndeterminate(value);
        this[visibilityProperty.setNative](this.visibility);
    }
    [busyProperty.setNative](value) {
        this[visibilityProperty.setNative](this.visibility);
    }
    [heightProperty.setNative](value) {
        this.nativeViewProtected.setTrackThickness(PercentLength.toDevicePixels(value, NaN, NaN));
    }
    [visibilityProperty.setNative](value) {
        super[visibilityProperty.setNative](this.busy || !this.indeterminate ? value : 'hidden');
    }
    public startAnimating() {
        this.busy = true;
    }
    public stopAnimating() {
        this.busy = false;
    }
    [colorProperty.setNative](color) {
        const array = Array.create('int', 1);
        array[0] = color.android;
        this.nativeViewProtected.setIndicatorColor(array);
        if (!this.backgroundColor) {
            this.nativeViewProtected.setTrackColor(getRippleColor(color));
        }
    }
    [backgroundColorProperty.setNative](color) {
        this.nativeViewProtected.setTrackColor(color.android);
    }
    [backgroundInternalProperty.setNative](value) {
        applyBorderBackground(this, value);
    }

    [trackCornerRadiusProperty.setNative](value) {
        this.nativeViewProtected.setTrackCornerRadius(Length.toDevicePixels(value, 0));
    }
}
