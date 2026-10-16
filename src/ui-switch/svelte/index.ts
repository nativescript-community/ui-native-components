import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { Switch } from '..';

/**
 * Registers the `<uiswitch>` element for svelte-native:
 * ```ts
 * import SwitchPlugin from '@nativescript-community/ui-switch/svelte';
 * SwitchPlugin.register();
 * ```
 */
export default class SwitchPlugin {
    static register() {
        registerNativeViewElement('uiswitch', () => Switch);
    }
}
