/**
 * Card for grouping content.
 * Android uses the Material 3 MaterialCardView. iOS uses a grouped rounded surface (no Liquid Glass: the HIG keeps it for controls).
 * `background-color`, `border-width`, `border-color` and `border-radius` apply to the card. `elevation` and `rippleColor` are Android only (see ui-core `installMixins`).
 * @module @nativescript-community/ui-card
 */

import { ContentView } from '@nativescript/core';
import { CardVariant } from './index-common';
export { CardVariant };

export class Card extends ContentView {
    /**
     * `elevated` (default), `filled` or `outlined`
     */
    variant: CardVariant;
}
