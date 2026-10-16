import { CardViewBase } from './cardview-common';
export * from './cardview-common';

// Material only component: on iOS this is the plain core ContentView, the extra properties are no-op.
export class CardView extends CardViewBase {}
