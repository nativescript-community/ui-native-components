import { Page } from '@nativescript/core';
import { AppBarScrollBehavior } from './index-common';
export { AppBarScrollBehavior };

/**
 * iOS: the navigation controller of the Frame already owns the bar (large title, blur, scroll edge effect): the page is a regular Page.
 */
export class AppPage extends Page {
    scrollBehavior: AppBarScrollBehavior = 'none';
}
