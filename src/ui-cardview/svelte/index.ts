import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { CardView } from '../cardview';

/**
 * Registers the `<uicardview>` element for svelte-native:
 * ```ts
 * import CardViewPlugin from '@nativescript-community/ui-cardview/svelte';
 * CardViewPlugin.register();
 * ```
 */
export default class CardViewPlugin {
    static register() {
        registerNativeViewElement('uicardview', () => CardView);
    }
}
