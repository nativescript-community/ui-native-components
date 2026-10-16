/**
 * Cross platform (Material) variants. On iOS they are mapped to the closest native UIButton style.
 */
export type MaterialButtonVariant = 'contained' | 'flat' | 'text' | 'outline';

/**
 * Native iOS UIButton.Configuration styles. On Android they are mapped to the closest Material variant.
 * The `*Glass` styles are Liquid Glass (iOS 26+) and fall back to the closest non glass style on earlier versions.
 */
export type IOSButtonVariant = 'plain' | 'gray' | 'tinted' | 'filled' | 'borderless' | 'bordered' | 'borderedTinted' | 'borderedProminent' | 'glass' | 'prominentGlass' | 'clearGlass' | 'prominentClearGlass';

export type ButtonVariant = MaterialButtonVariant | IOSButtonVariant;

/**
 * Semantic role of the button (see Apple HIG buttons "Roles").
 */
export type ButtonRole = 'normal' | 'primary' | 'cancel' | 'destructive';

const IOS_TO_MATERIAL: { [k in IOSButtonVariant]: MaterialButtonVariant } = {
    plain: 'text',
    borderless: 'text',
    gray: 'flat',
    tinted: 'flat',
    glass: 'flat',
    clearGlass: 'flat',
    filled: 'contained',
    borderedProminent: 'contained',
    prominentGlass: 'contained',
    prominentClearGlass: 'contained',
    bordered: 'outline',
    borderedTinted: 'outline'
};

const MATERIAL_TO_IOS: { [k in MaterialButtonVariant]: IOSButtonVariant } = {
    contained: 'prominentGlass',
    flat: 'tinted',
    text: 'plain',
    outline: 'glass'
};

/**
 * Returns the Material variant to use for any variant name (Material or iOS).
 */
export function toMaterialVariant(variant: ButtonVariant | string): MaterialButtonVariant {
    if (!variant) {
        return 'contained';
    }
    if (variant in MATERIAL_TO_IOS) {
        return variant as MaterialButtonVariant;
    }
    return IOS_TO_MATERIAL[variant as IOSButtonVariant] || 'contained';
}

/**
 * Returns the iOS variant to use for any variant name (Material or iOS).
 * Glass variants are returned as is: it is up to the platform implementation to fall back when Liquid Glass is not available.
 */
export function toIOSVariant(variant: ButtonVariant | string): IOSButtonVariant {
    if (!variant) {
        return MATERIAL_TO_IOS.contained;
    }
    if (variant in MATERIAL_TO_IOS) {
        return MATERIAL_TO_IOS[variant as MaterialButtonVariant];
    }
    return (variant in IOS_TO_MATERIAL ? variant : MATERIAL_TO_IOS.contained) as IOSButtonVariant;
}
