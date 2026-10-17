import { ContentView, CoreTypes } from '@nativescript/core';

/**
 * Android has no bottom accessory: the element is collapsed
 */
export class BottomAccessory extends ContentView {
    constructor() {
        super();
        this.visibility = CoreTypes.Visibility.collapse;
    }
}
