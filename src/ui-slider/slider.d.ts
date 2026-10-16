/**
 * Slider component: core Slider augmented with `trackFillColor`, `trackBackgroundColor`, `thumbColor` and `stepSize`.
 * Android uses Material Slider. iOS uses the native UISlider (ripple, elevation and hollow thumb are no-op).
 * @module @nativescript-community/ui-slider
 */

import { SliderBase } from './slider-common';
export * from './slider-common';
export * from './cssproperties';

export class Slider extends SliderBase {}
