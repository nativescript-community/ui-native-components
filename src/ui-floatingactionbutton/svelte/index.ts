import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { FloatingActionButton } from '../floatingactionbutton';

/**
 * Registers the `<uifloatingactionbutton>` element for svelte-native:
 * ```ts
 * import FloatingActionButtonPlugin from '@nativescript-community/ui-floatingactionbutton/svelte';
 * FloatingActionButtonPlugin.register();
 * ```
 */
export default class FloatingActionButtonPlugin {
    static register() {
        registerNativeViewElement('uifloatingactionbutton', () => FloatingActionButton);
    }
}
