/*
In NativeScript, the app.ts file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

import { svelteNative } from '@nativescript-community/svelte-native';
import Menu from './Menu.svelte';

import { installPlugin } from '@nativescript-community/template-snippet/svelte/install';
installPlugin();

//@ts-ignore
svelteNative(Menu, {});
