import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { Slider } from '../slider';

/**
 * Registers the `<uislider>` element for svelte-native:
 * ```ts
 * import SliderPlugin from '@nativescript-community/ui-slider/svelte';
 * SliderPlugin.register();
 * ```
 */
export default class SliderPlugin {
    static register() {
        registerNativeViewElement('uislider', () => Slider);
    }
}
