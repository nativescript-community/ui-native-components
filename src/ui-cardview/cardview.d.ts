/**
 * CardView component. Android only (Material): on iOS it is a plain core ContentView and the extra properties are no-op.
 * @module @nativescript-community/ui-cardview
 */

import { CardViewBase } from './cardview-common';
export * from './cardview-common';

export class CardView extends CardViewBase {}
