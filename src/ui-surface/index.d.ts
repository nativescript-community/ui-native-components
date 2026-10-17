/**
 * A floating surface for toolbars and groups of action buttons.
 * iOS: Liquid Glass (a system blur before iOS 26). Android: a Material 3 surface container pill, with elevation.
 * Put the buttons in it: `variant="text"` (Android) or `variant="plain"` (iOS) buttons keep the surface as the only visible shape.
 * It is a layout: use the children as in a GridLayout.
 * The shape is a capsule, set `border-radius` for another one.
 * @module @nativescript-community/ui-surface
 */

import { Color, GridLayout } from '@nativescript/core';
import { SurfaceVariant } from './index-common';
export { SurfaceVariant };

export class Surface extends GridLayout {
    /** `regular` (default) or `clear` */
    variant: SurfaceVariant;
    /** iOS: the glass reacts to touches */
    interactive: boolean;
    /** iOS: tint of the glass */
    tint: Color;
}
