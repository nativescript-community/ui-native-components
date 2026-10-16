import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { ActivityIndicator } from '..';

/**
 * Registers the `<uiactivityindicator>` element for svelte-native:
 * ```ts
 * import ActivityIndicatorPlugin from '@nativescript-community/ui-activityindicator/svelte';
 * ActivityIndicatorPlugin.register();
 * ```
 */
export default class ActivityIndicatorPlugin {
    static register() {
        registerNativeViewElement('uiactivityindicator', () => ActivityIndicator);
    }
}
