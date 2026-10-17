import { CSSType, ContentView, Property } from '@nativescript/core';

/**
 * Material 3 card variants. On iOS: `elevated` is the grouped background (iOS has no elevation), `filled` a tinted fill, `outlined` a hairline border.
 */
export type CardVariant = 'elevated' | 'filled' | 'outlined';

/**
 * A card groups related content. It has one child: put a layout in it.
 * Android: MaterialCardView. iOS: a grouped rounded surface, without Liquid Glass (the HIG keeps glass for controls, not for content).
 */
@CSSType('Card')
export abstract class CardBase extends ContentView {
    /** default: elevated */
    public variant: CardVariant;
}

export const variantProperty = new Property<CardBase, CardVariant>({ name: 'variant', defaultValue: 'elevated' });
variantProperty.register(CardBase);
