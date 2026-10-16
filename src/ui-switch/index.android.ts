import { Background, Color, backgroundInternalProperty } from '@nativescript/core';
import { applyBorderBackground } from '@nativescript-community/ui-core/border-background';

import { SwitchBase, onBackgroundColorProperty } from './index-common';
import { getColorStateList } from '@nativescript-community/ui-core/android/utils';
export class Switch extends SwitchBase {
    nativeViewProtected: com.google.android.material.materialswitch.MaterialSwitch;

    createNativeView() {
        return new com.google.android.material.materialswitch.MaterialSwitch(this._context);
    }

    [onBackgroundColorProperty.setNative](color: Color) {
        this.nativeViewProtected.setTrackTintList(color ? getColorStateList(color.android) :  null);
    }

    [backgroundInternalProperty.setNative](value: Background) {
        applyBorderBackground(this, value);
    }
}
