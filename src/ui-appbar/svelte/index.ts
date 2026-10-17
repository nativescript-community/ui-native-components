import { ActionBarElement, PageElement, registerElement } from '@nativescript-community/svelte-native/dom';
import { AppBar, AppPage } from '../index';

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

/** registers `<appPage>` and `<appBar>` */
export function register() {
    registerElement('AppPage', () => new AppPageElement());
    registerElement('AppBar', () => new AppBarElement());
}
