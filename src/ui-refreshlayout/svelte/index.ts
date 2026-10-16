import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { RefreshLayout } from '../refreshlayout';

/**
 * Registers the `<uirefreshlayout>` element for svelte-native:
 * ```ts
 * import RefreshLayoutPlugin from '@nativescript-community/ui-refreshlayout/svelte';
 * RefreshLayoutPlugin.register();
 * ```
 */
export default class RefreshLayoutPlugin {
    static register() {
        registerNativeViewElement('uirefreshlayout', () => RefreshLayout);
    }
}
