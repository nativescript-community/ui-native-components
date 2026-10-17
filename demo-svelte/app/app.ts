/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import { Page, Utils, isAndroid } from '@nativescript/core';
import { AppPage } from '@nativescript-community/ui-appbar';
import { svelteNative } from '@nativescript-community/svelte-native';
import Menu from './Menu.svelte';

import { installPlugin } from '@nativescript-community/template-snippet/svelte/install';
installPlugin();

// Android edge-to-edge: the pages (and so the action bar) draw under the status bar,
// the action bar is padded by the status bar height and the status bar icons are light.
if (isAndroid) {
    const originalOnLoaded = (Page.prototype as any).onLoaded;
    (Page.prototype as any).onLoaded = function () {
        originalOnLoaded.call(this);
        if ((this as any).__edgeToEdge) {
            return;
        }
        (this as any).__edgeToEdge = true;
        const resources = Utils.android.getApplicationContext().getResources();
        const id = resources.getIdentifier('status_bar_height', 'dimen', 'android');
        const statusBarHeight = id > 0 ? resources.getDimensionPixelSize(id) / resources.getDisplayMetrics().density : 24;
        this.statusBarStyle = 'light';
        if (this instanceof AppPage) {
            // the AppPage / AppBarLayout handles the status bar inset itself
            return;
        }
        this.androidOverflowEdge = 'top';
        if (this.actionBar) {
            const actionBar = this.actionBar;
            actionBar.height = 56 + statusBarHeight;
            // the NativeScript padding is ignored by the Toolbar layout: pad the native view
            const applyPadding = () => actionBar.nativeViewProtected?.setPadding(0, Math.round(statusBarHeight * Utils.layout.getDisplayDensity()), 0, 0);
            applyPadding();
            actionBar.on('loaded', applyPadding);
        }
    };
}

//@ts-ignore
svelteNative(Menu, {});
