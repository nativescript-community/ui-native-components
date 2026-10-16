import { CSSType, Color, ContentView } from '@nativescript/core';
import { cssProperty } from '@nativescript-community/ui-core';

@CSSType('CardView')
export abstract class CardViewBase extends ContentView {
    @cssProperty elevation: number;
    @cssProperty dynamicElevationOffset: number;
    @cssProperty rippleColor: Color;
    @cssProperty shape: string;
    @cssProperty rippleColorAlpha: number;
}
