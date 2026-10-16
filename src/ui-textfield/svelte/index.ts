import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { TextField } from '../textfield';

/**
 * Registers the `<uitextfield>` element for svelte-native:
 * ```ts
 * import TextFieldPlugin from '@nativescript-community/ui-textfield/svelte';
 * TextFieldPlugin.register();
 * ```
 */
export default class TextFieldPlugin {
    static register() {
        registerNativeViewElement('uitextfield', () => TextField);
    }
}
