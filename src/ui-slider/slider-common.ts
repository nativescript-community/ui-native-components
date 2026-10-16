import { CSSType, Color, Slider as NSSlider } from '@nativescript/core';
import { cssProperty } from '@nativescript-community/ui-core';

@CSSType('Slider')
export abstract class SliderBase extends NSSlider {
    @cssProperty rippleColor: Color;
    @cssProperty trackBackgroundColor: Color;
    @cssProperty trackFillColor: Color;
    @cssProperty thumbColor: Color;
    @cssProperty elevation: number;
    @cssProperty stepSize: number;
}
