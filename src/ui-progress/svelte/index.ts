import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { Progress } from '../progress';

/**
 * Registers the `<uiprogress>` element for svelte-native:
 * ```ts
 * import ProgressPlugin from '@nativescript-community/ui-progress/svelte';
 * ProgressPlugin.register();
 * ```
 */
export default class ProgressPlugin {
    static register() {
        registerNativeViewElement('uiprogress', () => Progress);
    }
}
