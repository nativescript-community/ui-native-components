import { install as installBottomSheet } from '@nativescript-community/ui-bottomsheet';
import { installMixins } from '@nativescript-community/ui-core';

import ActivityIndicatorPlugin from '@nativescript-community/ui-activityindicator/svelte';
import BottomNavigationPlugin from '@nativescript-community/ui-bottom-navigation/svelte';
import BottomNavigationBarPlugin from '@nativescript-community/ui-bottomnavigationbar/svelte';
import CheckBoxPlugin from '@nativescript-community/ui-checkbox/svelte';
import ButtonPlugin from '@nativescript-community/ui-button/svelte';
import CollectionViewPlugin from '@nativescript-community/ui-collectionview/svelte';
import FloatingActionButtonPlugin from '@nativescript-community/ui-floatingactionbutton/svelte';
import ProgressPlugin from '@nativescript-community/ui-progress/svelte';
import RefreshLayoutPlugin from '@nativescript-community/ui-refreshlayout/svelte';
import SearchBarPlugin from '@nativescript-community/ui-searchbar/svelte';
import SegmentedBarPlugin from '@nativescript-community/ui-segmentedbar/svelte';
import SliderPlugin from '@nativescript-community/ui-slider/svelte';
import SwitchPlugin from '@nativescript-community/ui-switch/svelte';
import TabsPlugin from '@nativescript-community/ui-tabs/svelte';
import TextFieldPlugin from '@nativescript-community/ui-textfield/svelte';
import TextViewPlugin from '@nativescript-community/ui-textview/svelte';

import BottomNavigation from './BottomNavigation.svelte';
import BottomNavigationBar from './BottomNavigationBar.svelte';
import BottomSheet from './BottomSheet.svelte';
import Buttons from './Buttons.svelte';
import CheckBoxes from './CheckBoxes.svelte';
import Controls from './Controls.svelte';
import DateTimePickers from './DateTimePickers.svelte';
import Dialogs from './Dialogs.svelte';
import FloatingActionButtons from './FloatingActionButtons.svelte';
import SegmentedBar from './SegmentedBar.svelte';
import Menus from './Menus.svelte';
import RefreshLayout from './RefreshLayout.svelte';
import SearchBars from './SearchBars.svelte';
import Styling from './Styling.svelte';
import Snackbar from './Snackbar.svelte';
import Tabs from './Tabs.svelte';
import TextFields from './TextFields.svelte';
import '../app.scss';

installMixins();
installBottomSheet();
export function installPlugin() {
    ActivityIndicatorPlugin.register();
    BottomNavigationBarPlugin.register();
    BottomNavigationPlugin.register();
    ButtonPlugin.register();
    CheckBoxPlugin.register();
    CollectionViewPlugin.register();
    FloatingActionButtonPlugin.register();
    ProgressPlugin.register();
    RefreshLayoutPlugin.register();
    SearchBarPlugin.register();
    SegmentedBarPlugin.register();
    SliderPlugin.register();
    SwitchPlugin.register();
    TabsPlugin.register();
    TextFieldPlugin.register();
    TextViewPlugin.register();
}

export const demos = [
    { name: 'Buttons', path: 'Buttons', component: Buttons },
    { name: 'Floating action buttons', path: 'FloatingActionButtons', component: FloatingActionButtons },
    { name: 'Text fields', path: 'TextFields', component: TextFields },
    { name: 'Checkbox', path: 'CheckBoxes', component: CheckBoxes },
    { name: 'Switch, slider, progress', path: 'Controls', component: Controls },
    { name: 'Segmented bar', path: 'SegmentedBar', component: SegmentedBar },
    { name: 'Menus', path: 'Menus', component: Menus },
    { name: 'Date and time pickers', path: 'DateTimePickers', component: DateTimePickers },
    { name: 'Pull to refresh', path: 'RefreshLayout', component: RefreshLayout },
    { name: 'Search bar', path: 'SearchBars', component: SearchBars },
    { name: 'Dialogs', path: 'Dialogs', component: Dialogs },
    { name: 'Bottom sheet', path: 'BottomSheet', component: BottomSheet },
    { name: 'Tabs', path: 'Tabs', component: Tabs },
    { name: 'Bottom navigation', path: 'BottomNavigation', component: BottomNavigation },
    { name: 'Bottom navigation bar', path: 'BottomNavigationBar', component: BottomNavigationBar },
    { name: 'Styling audit', path: 'Styling', component: Styling },
    { name: 'Snackbar', path: 'Snackbar', component: Snackbar }
];
