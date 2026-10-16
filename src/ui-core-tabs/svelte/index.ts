import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { TabContentItem } from '../tab-content-item';
import { TabStrip } from '../tab-strip';
import { TabStripItem } from '../tab-strip-item';

/**
 * Registers the `<uitabstrip>`, `<uitabstripitem>` and `<uitabcontentitem>` elements shared by the tabs components.
 */
export default class CoreTabsPlugin {
    static register() {
        registerNativeViewElement('uitabstrip', () => TabStrip);
        registerNativeViewElement('uitabstripitem', () => TabStripItem);
        registerNativeViewElement('uitabcontentitem', () => TabContentItem);
    }
}
