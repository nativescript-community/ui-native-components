import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { PullToRefresh } from '../pulltorefresh';

/**
 * Registers the `<uipulltorefresh>` element for svelte-native:
 * ```ts
 * import PullToRefreshPlugin from '@nativescript-community/ui-pulltorefresh/svelte';
 * PullToRefreshPlugin.register();
 * ```
 */
export default class PullToRefreshPlugin {
    static register() {
        registerNativeViewElement('uipulltorefresh', () => PullToRefresh);
    }
}
