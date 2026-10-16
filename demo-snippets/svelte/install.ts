import { install as installBottomSheet } from '@nativescript-community/ui-bottomsheet';
import { installMixins, themer } from '@nativescript-community/ui-core';

import ActivityIndicatorPlugin from '@nativescript-community/ui-activityindicator/svelte';
import BottomNavigationBarPlugin from '@nativescript-community/ui-bottomnavigationbar/svelte';
import ButtonPlugin from '@nativescript-community/ui-button/svelte';
import CardViewPlugin from '@nativescript-community/ui-cardview/svelte';
import FloatingActionButtonPlugin from '@nativescript-community/ui-floatingactionbutton/svelte';
import ProgressPlugin from '@nativescript-community/ui-progress/svelte';
import RipplePlugin from '@nativescript-community/ui-ripple/svelte';
import SliderPlugin from '@nativescript-community/ui-slider/svelte';
import SwitchPlugin from '@nativescript-community/ui-switch/svelte';
import TextFieldPlugin from '@nativescript-community/ui-textfield/svelte';
import TextViewPlugin from '@nativescript-community/ui-textview/svelte';

import BottomNavigationBar from './BottomNavigationBar.svelte';
import BottomSheet from './BottomSheet.svelte';
import Buttons from './Buttons.svelte';
import Cards from './Cards.svelte';
import Controls from './Controls.svelte';
import Dialogs from './Dialogs.svelte';
import FloatingActionButtons from './FloatingActionButtons.svelte';
import Snackbar from './Snackbar.svelte';
import TextFields from './TextFields.svelte';
import '../app.scss';

installMixins();
installBottomSheet();
// a custom shape, used by `shape="cut"` (Android only)
themer.createShape('cut', {
    cornerFamily: 'cut' as any,
    cornerSize: {
        value: 0.5,
        unit: '%'
    }
});

export function installPlugin() {
    ActivityIndicatorPlugin.register();
    BottomNavigationBarPlugin.register();
    ButtonPlugin.register();
    CardViewPlugin.register();
    FloatingActionButtonPlugin.register();
    ProgressPlugin.register();
    RipplePlugin.register();
    SliderPlugin.register();
    SwitchPlugin.register();
    TextFieldPlugin.register();
    TextViewPlugin.register();
}

export const demos = [
    { name: 'Buttons', path: 'Buttons', component: Buttons },
    { name: 'Floating action buttons', path: 'FloatingActionButtons', component: FloatingActionButtons },
    { name: 'Text fields', path: 'TextFields', component: TextFields },
    { name: 'Switch, slider, progress', path: 'Controls', component: Controls },
    { name: 'Card view and ripple', path: 'Cards', component: Cards },
    { name: 'Dialogs', path: 'Dialogs', component: Dialogs },
    { name: 'Bottom sheet', path: 'BottomSheet', component: BottomSheet },
    { name: 'Bottom navigation bar', path: 'BottomNavigationBar', component: BottomNavigationBar },
    { name: 'Snackbar', path: 'Snackbar', component: Snackbar }
];
