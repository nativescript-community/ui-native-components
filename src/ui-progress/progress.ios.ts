import { Background, Color, Screen, backgroundColorProperty, backgroundInternalProperty, colorProperty } from '@nativescript/core';
import { applyBorderBackground } from '@nativescript-community/ui-core/border-background';
import { ProgressBase, busyProperty, indeterminateProperty, progressBackgroundColorProperty, progressColorProperty } from './progress-common';

/**
 * iOS: determinate uses the native UIProgressView.
 * UIKit has no indeterminate progress bar, so `indeterminate` swaps the bar for a native UIActivityIndicatorView (spinner).
 */
export class Progress extends ProgressBase {
    nativeViewProtected: UIProgressView;
    private mIndicator: UIActivityIndicatorView;
    private mProgressColor: UIColor;
    private mTrackColor: UIColor;

    constructor() {
        super();
        this.effectiveMinHeight = 2 * Screen.mainScreen.scale;
    }

    public createNativeView() {
        return UIProgressView.new();
    }

    private updateBarColors() {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return;
        }
        if (this.indeterminate) {
            // hide the bar, the spinner is shown instead
            nativeView.progressTintColor = UIColor.clearColor;
            nativeView.trackTintColor = UIColor.clearColor;
        } else {
            nativeView.progressTintColor = this.mProgressColor || null;
            nativeView.trackTintColor = this.mTrackColor || null;
        }
    }

    private layoutIndicator() {
        const nativeView = this.nativeViewProtected;
        if (this.mIndicator && nativeView) {
            this.mIndicator.center = CGPointMake(nativeView.bounds.size.width / 2, nativeView.bounds.size.height / 2);
        }
    }

    _onSizeChanged() {
        super._onSizeChanged();
        this.layoutIndicator();
    }

    [colorProperty.setNative](value: Color | UIColor) {
        this.mProgressColor = value instanceof Color ? value.ios : value;
        this.updateBarColors();
    }
    [backgroundInternalProperty.setNative](value: Background) {
        applyBorderBackground(this, value);
    }
    [backgroundColorProperty.setNative](value: Color | UIColor) {
        this.mTrackColor = value instanceof Color ? value.ios : value;
        this.updateBarColors();
    }
    [progressColorProperty.setNative](color: Color) {
        this.mProgressColor = color ? color.ios : null;
        this.updateBarColors();
        if (this.mIndicator) {
            this.mIndicator.color = this.mProgressColor;
        }
    }
    [progressBackgroundColorProperty.setNative](color: Color) {
        this.mTrackColor = color ? color.ios : null;
        this.updateBarColors();
    }

    [indeterminateProperty.setNative](value: boolean) {
        const nativeView = this.nativeViewProtected;
        if (value) {
            if (!this.mIndicator) {
                this.mIndicator = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.Medium);
                this.mIndicator.hidesWhenStopped = true;
                if (this.mProgressColor) {
                    this.mIndicator.color = this.mProgressColor;
                }
                nativeView.addSubview(this.mIndicator);
            }
            this.layoutIndicator();
            if (this.busy) {
                this.mIndicator.startAnimating();
            }
        } else if (this.mIndicator) {
            this.mIndicator.stopAnimating();
            this.mIndicator.removeFromSuperview();
            this.mIndicator = null;
        }
        this.updateBarColors();
    }

    [busyProperty.setNative](value: boolean) {
        if (!this.mIndicator) {
            return;
        }
        if (value) {
            this.mIndicator.startAnimating();
        } else {
            this.mIndicator.stopAnimating();
        }
    }
}
