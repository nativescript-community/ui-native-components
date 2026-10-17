import { ContentView } from '@nativescript/core';

/**
 * A view shown above the tab bar, for a mini player, a status or a call to action.
 * iOS 26: the `UITabAccessory` of the tab bar controller, in a glass capsule: it is inline with the tab bar when the bar is minimized.
 * Android: not supported, the element is collapsed. Show the view yourself above the bar.
 * It has one child: any view.
 */
export class BottomAccessory extends ContentView {}
