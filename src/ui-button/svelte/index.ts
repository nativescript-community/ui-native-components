import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { Button } from '../button';

/**
 * Registers the `<uibutton>` element for svelte-native:
 * ```ts
 * import ButtonPlugin from '@nativescript-community/ui-button/svelte';
 * ButtonPlugin.register();
 * ```
 */
export default class ButtonPlugin {
    static register() {
        registerNativeViewElement('uibutton', () => Button);
    }
}
