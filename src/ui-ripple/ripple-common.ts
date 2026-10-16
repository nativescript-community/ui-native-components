import { CSSType, Color, StackLayout } from '@nativescript/core';
import { cssProperty } from '@nativescript-community/ui-core';

@CSSType('Ripple')
export abstract class RippleBase extends StackLayout {
    @cssProperty rippleColor: Color;
}
