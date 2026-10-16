import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { SearchBar } from '../searchbar';

/**
 * Registers the `<uisearchbar>` element for svelte-native:
 * ```ts
 * import SearchBarPlugin from '@nativescript-community/ui-searchbar/svelte';
 * SearchBarPlugin.register();
 * ```
 */
export default class SearchBarPlugin {
    static register() {
        registerNativeViewElement('uisearchbar', () => SearchBar);
    }
}
