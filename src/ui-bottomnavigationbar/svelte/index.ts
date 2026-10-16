import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { BottomNavigationBar, BottomNavigationTab } from '../bottomnavigationbar';

/**
 * Registers the `<uibottomnavigationbar>` and `<uibottomnavigationtab>` elements for svelte-native:
 * ```ts
 * import BottomNavigationBarPlugin from '@nativescript-community/ui-bottomnavigationbar/svelte';
 * BottomNavigationBarPlugin.register();
 * ```
 */
export default class BottomNavigationBarPlugin {
    static register() {
        registerNativeViewElement('uibottomnavigationbar', () => BottomNavigationBar);
        registerNativeViewElement('uibottomnavigationtab', () => BottomNavigationTab);
    }
}
