import { Background, Font, Screen, Utils, backgroundInternalProperty, borderBottomWidthProperty, borderLeftWidthProperty, borderRightWidthProperty, borderTopWidthProperty, fontInternalProperty, paddingInternalProperty } from '@nativescript/core';
import { ButtonRole, IOSButtonVariant } from './button-variant';
import { applyMixins } from './index.common';

/**
 * Support for UIButton.Configuration (iOS 15+, Liquid Glass styles on iOS 26+) on top of the core Button.
 *
 * The core Button drives the UIButton through the legacy APIs (setAttributedTitle, setImage, setTitleColor...).
 * On a button using a configuration:
 * - the attributed title, the image and the title color still work
 * - the font, `contentEdgeInsets` and the background/border/corner radius are ignored
 * - the core forces `UIColor.labelColor` as the text color, which hides the adaptive foreground color of the configuration
 * The mixin below routes those few properties to the configuration.
 */

export function supportsButtonConfiguration() {
    return typeof UIButtonConfiguration !== 'undefined';
}

function glassOrFallback(selector: string, fallback: () => UIButtonConfiguration) {
    // glass configurations only exist on iOS 26+ (and are not in the typings yet)
    const factory = (UIButtonConfiguration as any)[selector];
    return Utils.ios.MajorVersion >= 26 && typeof factory === 'function' ? (factory.call(UIButtonConfiguration) as UIButtonConfiguration) : fallback();
}

/**
 * Creates the configuration matching an iOS variant.
 * Glass variants fall back to the closest non glass style before iOS 26.
 */
export function createButtonConfiguration(variant: IOSButtonVariant): UIButtonConfiguration {
    const C = UIButtonConfiguration;
    switch (variant) {
        case 'plain':
            return C.plainButtonConfiguration();
        case 'gray':
            return C.grayButtonConfiguration();
        case 'tinted':
            return C.tintedButtonConfiguration();
        case 'filled':
            return C.filledButtonConfiguration();
        case 'borderless':
            return C.borderlessButtonConfiguration();
        case 'bordered':
            return C.borderedButtonConfiguration();
        case 'borderedTinted':
            return C.borderedTintedButtonConfiguration();
        case 'borderedProminent':
            return C.borderedProminentButtonConfiguration();
        case 'glass':
            return glassOrFallback('glassButtonConfiguration', () => C.tintedButtonConfiguration());
        case 'clearGlass':
            return glassOrFallback('clearGlassButtonConfiguration', () => C.plainButtonConfiguration());
        case 'prominentClearGlass':
            return glassOrFallback('prominentClearGlassButtonConfiguration', () => C.filledButtonConfiguration());
        case 'prominentGlass':
        default:
            return glassOrFallback('prominentGlassButtonConfiguration', () => C.filledButtonConfiguration());
    }
}

export interface ButtonConfigurationState {
    variant: IOSButtonVariant;
    /**
     * use a capsule shape (floating action button)
     */
    capsule?: boolean;
    foreground?: UIColor;
    font?: UIFont;
    background?: UIColor;
    cornerRadius?: number;
    strokeWidth?: number;
    strokeColor?: UIColor;
    insets?: { top: number; leading: number; bottom: number; trailing: number };
    busy?: boolean;
}

/**
 * Creates the UIButton for a variant. The state is stored on the owner, see {@link applyButtonConfigurationState}
 */
export function createConfigurationButton(owner: any, state: ButtonConfigurationState): UIButton {
    owner._configurationState = state;
    const button = UIButton.buttonWithConfigurationPrimaryAction(buildConfiguration(state), null);
    if (button.titleLabel) {
        // This is the default for both platforms
        button.titleLabel.textAlignment = NSTextAlignment.Center;
    }
    button.pointerInteractionEnabled = true;
    return button;
}

function buildConfiguration(state: ButtonConfigurationState) {
    const configuration = createButtonConfiguration(state.variant);
    if (state.capsule) {
        configuration.cornerStyle = UIButtonConfigurationCornerStyle.Capsule;
    }
    if (state.foreground) {
        configuration.baseForegroundColor = state.foreground;
    }
    const background = configuration.background;
    if (state.background) {
        // glass and tinted styles use the base color, the other ones draw the background color
        configuration.baseBackgroundColor = state.background;
        background.backgroundColor = state.background;
    }
    if (state.cornerRadius > 0) {
        background.cornerRadius = state.cornerRadius;
        configuration.cornerStyle = UIButtonConfigurationCornerStyle.Fixed;
    }
    if (state.strokeWidth > 0) {
        background.strokeWidth = state.strokeWidth;
        background.strokeColor = state.strokeColor || null;
    }
    configuration.background = background;
    if (state.insets) {
        configuration.contentInsets = state.insets as any;
    }
    configuration.showsActivityIndicator = !!state.busy;
    const font = state.font;
    if (font) {
        // the configuration applies its own font over the attributed title: it can only be changed through the transformer
        configuration.titleTextAttributesTransformer = (attributes: NSDictionary<string, any>) => {
            const result = NSMutableDictionary.dictionaryWithDictionary(attributes);
            result.setObjectForKey(font, NSFontAttributeName);
            return result;
        };
    }
    return configuration;
}

/**
 * Rebuilds the configuration from the state of the owner. The legacy title and image are stored on the button itself and are kept.
 */
export function applyButtonConfigurationState(owner: any, changes?: Partial<ButtonConfigurationState>) {
    const state: ButtonConfigurationState = owner._configurationState;
    const nativeView: UIButton = owner.nativeViewProtected;
    if (!state || !nativeView) {
        return;
    }
    if (changes) {
        Object.assign(state, changes);
    }
    nativeView.configuration = buildConfiguration(state);
    nativeView.setNeedsUpdateConfiguration();
}

const toDIP = (value: number) => Utils.layout.toDeviceIndependentPixels(value);

function updateInsets(owner: any) {
    applyButtonConfigurationState(owner, {
        insets: {
            top: toDIP(owner.effectivePaddingTop + owner.effectiveBorderTopWidth),
            leading: toDIP(owner.effectivePaddingLeft + owner.effectiveBorderLeftWidth),
            bottom: toDIP(owner.effectivePaddingBottom + owner.effectiveBorderBottomWidth),
            trailing: toDIP(owner.effectivePaddingRight + owner.effectiveBorderRightWidth)
        }
    });
}

/**
 * Overrides of the core Button implementation, applied with `applyMixins(..., { override: true })`
 */
class ButtonConfigurationMixin {
    //TODO: remove as it needs to be added after TS 5.7 change https://github.com/microsoft/TypeScript/pull/59860
    [key: symbol]: (...args: any[]) => any | void;

    _setColor(this: any, color: UIColor) {
        const nativeView: UIButton = this.nativeTextViewProtected;
        // the core forces labelColor when there is no color: keep the (adaptive) foreground color of the configuration instead
        const explicit = this.style?.color ? color : null;
        nativeView.setTitleColorForState(explicit, UIControlState.Normal);
        applyButtonConfigurationState(this, { foreground: explicit });
    }

    [fontInternalProperty.setNative](this: any, value: Font | UIFont) {
        const nativeView: UIButton = this.nativeTextViewProtected;
        // the font of the legacy `titleLabel` is ignored with a configuration
        const font = value instanceof Font ? value.getUIFont(nativeView.titleLabel?.font || UIFont.systemFontOfSize(UIFont.buttonFontSize)) : value;
        applyButtonConfigurationState(this, { font });
    }

    [paddingInternalProperty.setNative](this: any, value: any) {
        updateInsets(this);
    }
    [borderTopWidthProperty.setNative](this: any, value: any) {
        updateInsets(this);
    }
    [borderRightWidthProperty.setNative](this: any, value: any) {
        updateInsets(this);
    }
    [borderBottomWidthProperty.setNative](this: any, value: any) {
        updateInsets(this);
    }
    [borderLeftWidthProperty.setNative](this: any, value: any) {
        updateInsets(this);
    }

    [backgroundInternalProperty.setNative](this: any, value: Background) {
        const scale = Screen.mainScreen.scale;
        applyButtonConfigurationState(this, {
            background: value.color ? value.color.ios : null,
            cornerRadius: value.borderTopLeftRadius / scale,
            strokeWidth: value.borderTopWidth / scale,
            strokeColor: value.borderTopColor ? value.borderTopColor.ios : null
        });
    }
}

class ButtonTextMixin {
    //TODO: remove as it needs to be added after TS 5.7 change https://github.com/microsoft/TypeScript/pull/59860
    [key: symbol]: (...args: any[]) => any | void;

    // the core draws the title with the font of `titleLabel`, ignored by a configuration: the configured font (an icon font
    // for glyph buttons) is only applied by the next configuration update, which otherwise waits for the first touch
    _setNativeText(this: any) {
        this.nativeViewProtected?.setNeedsUpdateConfiguration();
    }
}

/**
 * Makes a core Button class (or subclass) render with the UIButton configuration of its native view.
 * The native view must be created with {@link createConfigurationButton}.
 */
export function installButtonConfiguration(ctor: any) {
    applyMixins(ctor, [ButtonConfigurationMixin], { override: true });
    applyMixins(ctor, [ButtonTextMixin], { after: true });
}

/**
 * Applies a semantic role: UIKit uses it for accessibility/menus, a destructive role is also drawn in red.
 */
export function applyButtonRole(owner: any, role: ButtonRole) {
    const nativeView: UIButton = owner.nativeViewProtected;
    switch (role) {
        case 'primary':
            nativeView.role = UIButtonRole.Primary;
            break;
        case 'cancel':
            nativeView.role = UIButtonRole.Cancel;
            break;
        case 'destructive':
            nativeView.role = UIButtonRole.Destructive;
            break;
        default:
            nativeView.role = UIButtonRole.Normal;
    }
    // configurations derive their colors from the tint color
    nativeView.tintColor = role === 'destructive' ? UIColor.systemRedColor : null;
}

export function applyButtonBusy(owner: any, busy: boolean) {
    applyButtonConfigurationState(owner, { busy });
}
