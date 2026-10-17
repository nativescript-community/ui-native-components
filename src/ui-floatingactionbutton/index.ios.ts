import { ImageSource } from '@nativescript/core';
import { toIOSVariant } from '@nativescript-community/ui-core/button-variant';
import { createConfigurationButton, installButtonConfiguration, supportsButtonConfiguration } from '@nativescript-community/ui-core/ios-button-configuration';
import { FloatingActionButtonBase, expandedProperty, imageSourceProperty, sizeProperty, srcProperty } from './index-common';

const MINI_SIZE = 40;
const NORMAL_SIZE = 56;

/**
 * iOS: native UIButton rendered with UIButton.Configuration, a capsule (round when only the icon is shown).
 * `prominentGlass` by default (Liquid Glass on iOS 26+, filled before). Material only properties (elevation, ripple, shape) do not exist on iOS.
 */
export class FloatingActionButton extends FloatingActionButtonBase {
    //TODO: remove as it needs to be added after TS 5.7 change https://github.com/microsoft/TypeScript/pull/59860
    [key: symbol]: (...args: any[]) => any | void;

    nativeViewProtected: UIButton;

    public createNativeView() {
        if (!supportsButtonConfiguration()) {
            const nativeView = UIButton.buttonWithType(UIButtonType.System);
            nativeView.clipsToBounds = true;
            return nativeView;
        }
        return createConfigurationButton(this, { variant: toIOSVariant(this.variant), capsule: true });
    }

    private get fabSizeDip() {
        return this.size === 'mini' ? MINI_SIZE : NORMAL_SIZE;
    }

    initNativeView() {
        super.initNativeView();
        this.updateMinSize();
    }

    private updateMinSize() {
        // defaults set through css so that they can be overridden
        const size = this.fabSizeDip;
        this.style['css:height'] = size;
        // only the icon: round button
        this.style['css:width'] = this.expanded ? 'auto' : size;
    }

    _onSizeChanged() {
        super._onSizeChanged();
        if (!supportsButtonConfiguration()) {
            const nativeView = this.nativeViewProtected;
            nativeView.layer.cornerRadius = Math.min(nativeView.bounds.size.width, nativeView.bounds.size.height) / 2;
        }
    }

    public show() {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return;
        }
        nativeView.hidden = false;
        nativeView.transform = CGAffineTransformMakeScale(0.01, 0.01);
        UIView.animateWithDurationAnimations(0.2, () => {
            nativeView.transform = CGAffineTransformIdentity;
            nativeView.alpha = 1;
        });
    }

    public hide() {
        const nativeView = this.nativeViewProtected;
        if (!nativeView) {
            return;
        }
        UIView.animateWithDurationAnimationsCompletion(
            0.2,
            () => {
                nativeView.transform = CGAffineTransformMakeScale(0.01, 0.01);
                nativeView.alpha = 0;
            },
            () => {
                nativeView.hidden = true;
            }
        );
    }

    public _setNativeImage(nativeImage: UIImage) {
        this.nativeViewProtected.setImageForState(nativeImage ? nativeImage.imageWithRenderingMode(UIImageRenderingMode.AlwaysTemplate) : nativeImage, UIControlState.Normal);
    }
    [imageSourceProperty.setNative](value: ImageSource) {
        this._setNativeImage(value ? value.ios : null);
    }
    [srcProperty.setNative](value: any) {
        this._createImageSourceFromSrc(value);
    }
    [sizeProperty.setNative](value: string) {
        this.updateMinSize();
    }
    [expandedProperty.setNative](value: boolean) {
        // the title is only shown when expanded (extended FAB)
        this._setNativeText();
        this.updateMinSize();
    }
}

if (supportsButtonConfiguration()) {
    installButtonConfiguration(FloatingActionButton);
    // installButtonConfiguration replaces _setNativeText: wrap it, when not expanded only the icon is shown
    const setNativeText = (FloatingActionButton.prototype as any)._setNativeText;
    (FloatingActionButton.prototype as any)._setNativeText = function (this: FloatingActionButton, reset = false) {
        return setNativeText.call(this, this.expanded === false ? true : reset);
    };
}
