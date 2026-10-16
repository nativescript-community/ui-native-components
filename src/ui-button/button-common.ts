import { Button, CSSType, Color, ImageAsset, ImageSource, Property, Utils, booleanConverter } from '@nativescript/core';
import { cssProperty } from '@nativescript-community/ui-core';
import { VerticalTextAlignment } from '@nativescript-community/text';

import { ButtonRole, ButtonVariant, IOSButtonVariant, MaterialButtonVariant, toIOSVariant, toMaterialVariant } from '@nativescript-community/ui-core/button-variant';
export { ButtonRole, ButtonVariant, IOSButtonVariant, MaterialButtonVariant, toIOSVariant, toMaterialVariant };

@CSSType('Button')
export abstract class ButtonBase extends Button {
    /**
     * Gets or sets the variant of the button. Read once when the native view is created.
     * Material names (`contained`, `flat`, `text`, `outline`) work on every platform, iOS names (`prominentGlass`, `glass`, `tinted`...) too.
     */
    public variant: ButtonVariant = 'contained';

    /**
     * Gets or sets the semantic role of the button.
     */
    public role: ButtonRole;

    /**
     * Shows an activity indicator in the button while a long action runs.
     * iOS only (UIButton.Configuration `showsActivityIndicator`), no-op on Android.
     */
    public busy: boolean;

    /**
     * Gets or sets the elevation of the button.
     */
    @cssProperty elevation: number;

    /**
     * Gets or sets the dynamic elevation offset of the button.
     */
    @cssProperty dynamicElevationOffset: number;

    /**
     * Gets or sets the ripple-color of the button.
     */
    @cssProperty rippleColor: Color;

    /**
     * Gets or sets the ripple-color alpha of the button.
     */
    @cssProperty rippleColorAlpha: number;

    /**
     * Gets or sets the {@link VerticalTextAlignment|vertical text alignment} of the button.
     */
    @cssProperty verticalTextAlignment: VerticalTextAlignment;

    /**
     * Gets or sets the shape of the button.
     */
    @cssProperty shape: string;

    /**
     * Gets or sets the icon imageSource of the button.
     */
    public imageSource: ImageSource;

    /**
     * Gets or sets the icon src of the button.
     */
    public src: string | ImageSource;

    public isLoading: boolean;
    /**
     * @internal //copied from image common
     */
    protected async _createImageSourceFromSrc(value: string | ImageSource | ImageAsset, asIcon = true) {
        const originalValue = value;
        if (typeof value === 'string' || value instanceof String) {
            value = value.trim();
            this.imageSource = null;
            this['_url'] = value;

            this.isLoading = true;

            let source: ImageSource;
            const imageLoaded = () => {
                const currentValue = this.src;
                if (asIcon && currentValue !== originalValue) {
                    return;
                }
                this.setImageSource(source, asIcon);
                this.isLoading = false;
            };

            if (Utils.isDataURI(value)) {
                const base64Data = value.split(',')[1];
                if (base64Data !== undefined) {
                    source = await ImageSource.fromBase64(base64Data);
                    imageLoaded();
                }
            } else if (Utils.isFileOrResourcePath(value)) {
                if (value.indexOf(Utils.RESOURCE_PREFIX) === 0) {
                    const resPath = value.substr(Utils.RESOURCE_PREFIX.length);
                    source = await ImageSource.fromResource(resPath);
                    imageLoaded();
                } else if (value.indexOf(Utils.SYSTEM_PREFIX) === 0) {
                    // system image (SF Symbol on iOS)
                    source = await ImageSource.fromSystemImage(value.slice(Utils.SYSTEM_PREFIX.length));
                    imageLoaded();
                } else {
                    source = await ImageSource.fromFile(value);
                    imageLoaded();
                }
            } else {
                this.imageSource = null;
                source = await ImageSource.fromUrl(value);
                imageLoaded();
            }
        } else if (value instanceof ImageSource) {
            // Support binding the imageSource trough the src property
            this.setImageSource(value, asIcon);
            this.isLoading = false;
        } else if (value instanceof ImageAsset) {
            ImageSource.fromAsset(value).then((result) => {
                this.setImageSource(result, asIcon);
                this.isLoading = false;
            });
        } else {
            // native source
            this.setImageSource(new ImageSource(value), asIcon);
            this.isLoading = false;
        }
    }

    setImageSource(value, asIcon = true) {
        this.imageSource = value;
    }
}

export const roleProperty = new Property<ButtonBase, ButtonRole>({ name: 'role', defaultValue: 'normal' });
roleProperty.register(ButtonBase);

export const busyProperty = new Property<ButtonBase, boolean>({ name: 'busy', defaultValue: false, valueConverter: booleanConverter });
busyProperty.register(ButtonBase);

export const imageSourceProperty = new Property<ButtonBase, ImageSource>({ name: 'imageSource' });

export const srcProperty = new Property<ButtonBase, any>({
    name: 'src'
});
imageSourceProperty.register(ButtonBase);
srcProperty.register(ButtonBase);
