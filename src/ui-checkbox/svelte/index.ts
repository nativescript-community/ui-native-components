import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { CheckBox } from '../checkbox';

/**
 * Registers the `<uicheckbox>` element for svelte-native:
 * ```ts
 * import CheckBoxPlugin from '@nativescript-community/ui-checkbox/svelte';
 * CheckBoxPlugin.register();
 * ```
 */
export default class CheckBoxPlugin {
    static register() {
        registerNativeViewElement('uicheckbox', () => CheckBox);
    }
}
