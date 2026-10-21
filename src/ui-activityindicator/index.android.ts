import { inflateLayout } from '@nativescript-community/ui-core/android/utils';
import { Utils } from '@nativescript/core';
import { ActivityIndicatorBase, indeterminateProperty, maxValueProperty, valueProperty, wavyProperty } from './index-common';

export class ActivityIndicator extends ActivityIndicatorBase {
    nativeViewProtected: com.google.android.material.progressindicator.CircularProgressIndicator;
    private defaults?: { inset: number; thickness: number; outer: number };

    // The indicator draws at its own size (40dp, 48dp when wavy), whatever the size of the view. NativeScript lays out
    // natively on Android, onMeasure/onLayout are never called in JS, and the Material indicator measures itself at its
    // own size whatever the spec: the size asked for (the smallest side of width/height) is applied to it before the
    // first measure, and again if the layout changes.
    createNativeView() {
        return inflateLayout(this._context, 'ns_ui_circular_progress') as com.google.android.material.progressindicator.CircularProgressIndicator;
    }

    initNativeView() {
        // before super: that is where the native layout listener is installed, only if somebody listens by then
        this.on('layoutChanged', this.fitIndicatorSize, this);
        super.initNativeView();
        // the first measure must already see the size: the indicator measures itself at its own size, whatever the spec
        const requested = this.getRequestedSize();
        if (requested !== Infinity) {
            this.applyIndicatorSize(requested);
        }
    }
    disposeNativeView() {
        this.off('layoutChanged', this.fitIndicatorSize, this);
        super.disposeNativeView();
    }
    // the smallest side of the width/height asked for, in pixels, Infinity without any
    private getRequestedSize() {
        const toPixels = (length: any) => {
            if (typeof length === 'number') {
                return Math.round(Utils.layout.toDevicePixels(length));
            }
            if (length && typeof length === 'object') {
                return length.unit === 'dip' ? Math.round(Utils.layout.toDevicePixels(length.value)) : length.unit === 'px' ? length.value : Infinity;
            }
            return Infinity;
        };
        return Math.min(toPixels(this.width), toPixels(this.height));
    }
    private fitIndicatorSize() {
        const params = this.nativeViewProtected?.getLayoutParams();
        const requested = params ? Math.min(params.width > 0 ? params.width : Infinity, params.height > 0 ? params.height : Infinity) : Infinity;
        if (requested !== Infinity) {
            this.applyIndicatorSize(requested);
        }
    }
    private applyIndicatorSize(requested: number) {
        const indicator = this.nativeViewProtected;
        // a smaller indicator gets a thinner track and a smaller inset, or it ends up a blob
        this.defaults ??= { inset: indicator.getIndicatorInset(), thickness: indicator.getTrackThickness(), outer: indicator.getIndicatorSize() + 2 * indicator.getIndicatorInset() };
        const scale = Math.min(1, requested / this.defaults.outer);
        const inset = Math.round(this.defaults.inset * scale);
        const thickness = Math.max(1, Math.round(this.defaults.thickness * scale));
        const indicatorSize = Math.max(0, requested - 2 * inset);
        if (inset !== indicator.getIndicatorInset() || thickness !== indicator.getTrackThickness() || indicatorSize !== indicator.getIndicatorSize()) {
            indicator.setIndicatorInset(inset);
            indicator.setTrackThickness(thickness);
            indicator.setIndicatorSize(indicatorSize);
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
