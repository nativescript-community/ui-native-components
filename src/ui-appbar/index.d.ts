import { Page } from '@nativescript/core';
export type AppBarScrollBehavior = 'none' | 'lift' | 'hide' | 'collapse';
/**
 * Page whose content scrolls with the app bar (Material AppBarLayout on Android, navigation bar on iOS).
 * Compatible with gesturehandler: the Android Coordinator is nested in the Page root.
 */
export class AppPage extends Page {
    scrollBehavior: AppBarScrollBehavior;
}
