import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { SegmentedBar, SegmentedBarItem } from '../segmentedbar';

/**
 * Registers `<uisegmentedbar>` and `<uisegmentedbaritem>` for svelte-native:
 * ```ts
 * import SegmentedBarPlugin from '@nativescript-community/ui-segmentedbar/svelte';
 * SegmentedBarPlugin.register();
 * ```
 */
export default class SegmentedBarPlugin {
    static register() {
        registerNativeViewElement('uisegmentedbar', () => SegmentedBar);
        registerNativeViewElement('uisegmentedbaritem', () => SegmentedBarItem as any);
    }
}
