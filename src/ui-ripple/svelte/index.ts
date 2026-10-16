import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { Ripple } from '../ripple';

/**
 * Registers the `<uiripple>` element for svelte-native:
 * ```ts
 * import RipplePlugin from '@nativescript-community/ui-ripple/svelte';
 * RipplePlugin.register();
 * ```
 */
export default class RipplePlugin {
    static register() {
        registerNativeViewElement('uiripple', () => Ripple);
    }
}
