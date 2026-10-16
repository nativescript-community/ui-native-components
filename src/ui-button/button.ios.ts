import { Color, ImageSource } from '@nativescript/core';
import { applyButtonBusy, applyButtonRole, createConfigurationButton, installButtonConfiguration, supportsButtonConfiguration } from '@nativescript-community/ui-core/ios-button-configuration';
import { toIOSVariant } from '@nativescript-community/ui-core/button-variant';
import { ButtonBase, ButtonRole, busyProperty, imageSourceProperty, roleProperty, srcProperty } from './button-common';

/**
 * iOS: native UIButton rendered with UIButton.Configuration (iOS 15+), Liquid Glass styles on iOS 26+.
 * `variant` accepts the Material names (mapped to the closest native style) and the native names (`prominentGlass`, `glass`, `tinted`...).
 * Material only properties (elevation, ripple, shape...) are no-op.
 * Before iOS 15 it is the plain core UIButton.
 */
export class Button extends ButtonBase {
    //TODO: remove as it needs to be added after TS 5.7 change https://github.com/microsoft/TypeScript/pull/59860
    [key: symbol]: (...args: any[]) => any | void;

    nativeViewProtected: UIButton;

    public createNativeView() {
        if (!supportsButtonConfiguration()) {
            return super.createNativeView();
        }
        return createConfigurationButton(this, { variant: toIOSVariant(this.variant) });
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
    [roleProperty.setNative](value: ButtonRole) {
        applyButtonRole(this, value);
    }
    [busyProperty.setNative](value: boolean) {
        if (supportsButtonConfiguration()) {
            applyButtonBusy(this, value);
        }
    }
}

if (supportsButtonConfiguration()) {
    installButtonConfiguration(Button);
}
