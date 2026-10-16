import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { TextView } from '../textview';

/**
 * Registers the `<uitextview>` element for svelte-native:
 * ```ts
 * import TextViewPlugin from '@nativescript-community/ui-textview/svelte';
 * TextViewPlugin.register();
 * ```
 */
export default class TextViewPlugin {
    static register() {
        registerNativeViewElement('uitextview', () => TextView);
    }
}
