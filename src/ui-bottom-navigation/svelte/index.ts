import CoreTabsPlugin from '@nativescript-community/ui-core-tabs/svelte';
import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { BottomNavigation } from '..';

/**
 * Registers the `<uibottomnavigation>` element (and the tab strip elements) for svelte-native:
 * ```ts
 * import BottomNavigationPlugin from '@nativescript-community/ui-bottom-navigation/svelte';
 * BottomNavigationPlugin.register();
 * ```
 */
export default class BottomNavigationPlugin {
    static register() {
        CoreTabsPlugin.register();
        registerNativeViewElement('uibottomnavigation', () => BottomNavigation);
    }
}
