import { ActionBarElement, PageElement, registerElement, registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { NavigationButton } from '@nativescript/core';
import { AppBar, AppBarBottomView, AppBarItem, AppBarSearchField, AppPage, AppPageOverlay, AppPageSearchContent } from '../index';

/** svelte-native `navigate` needs a PageElement: this one wraps an AppPage instead of the core Page */
class AppPageElement extends PageElement {
    constructor() {
        super();
        const page = new AppPage();
        (page as any).__SvelteNativeElement__ = this;
        (this as any)._nativeElement = page;
    }
}

/** same for the ActionBarElement (it handles `actionItems`) */
class AppBarElement extends ActionBarElement {
    constructor() {
        super();
        const bar = new AppBar();
        (bar as any).__SvelteNativeElement__ = this;
        (this as any)._nativeElement = bar;
    }
}

/** registers `<appPage>`, `<appBar>`, `<appBarItem>`, `<appBarSearchField>`, `<appBarBottomView>` and `<navigationButton>` (not registered by svelte-native: only its `<actionBar>` does) */
export function register() {
    registerElement('AppPage', () => new AppPageElement());
    registerElement('AppBar', () => new AppBarElement());
    registerNativeViewElement('AppPageSearchContent', () => AppPageSearchContent as any, 'searchContent');
    registerNativeViewElement('AppPageOverlay', () => AppPageOverlay as any, 'overlay');
    registerNativeViewElement('NavigationButton', () => NavigationButton, 'navigationButton');
    registerNativeViewElement('AppBarSearchField', () => AppBarSearchField as any, 'searchField');
    registerNativeViewElement('AppBarBottomView', () => AppBarBottomView as any, 'bottomView');
    registerNativeViewElement('AppBarItem', () => AppBarItem as any, 'actionItems');
}
