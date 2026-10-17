import { Color, Property } from '@nativescript/core';

/**
 * iOS 26 glass: `regular` or `clear`. Android: `regular` is the Material 3 surface container, `clear` a transparent surface with the outline only.
 */
export type SurfaceVariant = 'regular' | 'clear';

/**
 * `Surface` is a layout (a GridLayout) for floating controls: toolbars, groups of action buttons, overlays on content.
 * The properties are declared per platform: iOS extends the core `LiquidGlass` layout, Android the core `GridLayout`.
 */
export const variantProperty = new Property<any, SurfaceVariant>({ name: 'variant', defaultValue: 'regular' });
/** iOS: the glass reacts to touches. Android: ignored */
export const interactiveProperty = new Property<any, boolean>({ name: 'interactive', defaultValue: false, valueConverter: (v: any) => v === true || v === 'true' });
/** iOS: tint of the glass. Android: ignored (use `background-color`) */
export const tintProperty = new Property<any, Color>({ name: 'tint', equalityComparer: Color.equals, valueConverter: (v) => new Color(v) });
