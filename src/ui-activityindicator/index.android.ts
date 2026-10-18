import { inflateLayout } from '@nativescript-community/ui-core/android/utils';
import { Utils } from '@nativescript/core';
import { ActivityIndicatorBase, indeterminateProperty, maxValueProperty, valueProperty, wavyProperty } from './index-common';

export class ActivityIndicator extends ActivityIndicatorBase {
    nativeViewProtected: com.google.android.material.progressindicator.CircularProgressIndicator;

    // The indicator draws at its own size (40dp, 48dp when wavy), whatever the size of the view: it follows the size of the view
    // (width/height of the view, the smallest side) in onLayout.
    createNativeView() {
        return inflateLayout(this._context, 'ns_ui_circular_progress') as com.google.android.material.progressindicator.CircularProgressIndicator;
    }

    onLayout(left: number, top: number, right: number, bottom: number) {
        super.onLayout(left, top, right, bottom);
        const indicator = this.nativeViewProtected;
        const size = Math.min(right - left, bottom - top);
        if (indicator && size > 0 && (this.width !== undefined || this.height !== undefined)) {
            const inset = indicator.getIndicatorInset();
            indicator.setIndicatorSize(Math.max(0, size - 2 * inset));
        }
    }

    [wavyProperty.setNative](value: boolean) {
        // the wave APIs are new in Material 1.14: not in the typings
        const indicator = this.nativeViewProtected as any;
        const px = (dip: number) => Math.round(Utils.layout.toDevicePixels(dip));
        // the values of the Widget.Material3Expressive.CircularProgressIndicator.Wavy style
        indicator.setWaveAmplitude(value ? px(1.6) : 0);
        indicator.setWavelength(value ? px(15) : 0);
        if (value) {
            indicator.setIndicatorInset(0);
        }
    }

    [valueProperty.getDefault](): number {
        return 0;
    }
    [valueProperty.setNative](value: number) {
        this.nativeViewProtected.setProgress(value);
    }

    [maxValueProperty.getDefault](): number {
        return 100;
    }
    [maxValueProperty.setNative](value: number) {
        this.nativeViewProtected.setMax(value);
    }

    [indeterminateProperty.setNative](value: boolean) {
        this.nativeViewProtected.setIndeterminate(value);
    }
}
