import CoreTabsPlugin from '@nativescript-community/ui-core-tabs/svelte';
import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { Tabs } from '..';

/**
 * Registers the `<uitabs>` element (and the tab strip elements) for svelte-native:
 * ```ts
 * import TabsPlugin from '@nativescript-community/ui-tabs/svelte';
 * TabsPlugin.register();
 * ```
 */
export default class TabsPlugin {
    static register() {
        CoreTabsPlugin.register();
        registerNativeViewElement('uitabs', () => Tabs);
    }
}
