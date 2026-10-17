import { install as installBottomSheet } from '@nativescript-community/ui-bottomsheet';
import { installMixins } from '@nativescript-community/ui-core';
import { install as installGestureHandler } from '@nativescript-community/gesturehandler';
import { AppPage } from '@nativescript-community/ui-appbar';
import { PageElement, registerElement } from '@nativescript-community/svelte-native/dom';

import CollectionViewPlugin from '@nativescript-community/ui-collectionview/svelte';
import { registerNativeViewElement } from '@nativescript-community/svelte-native/dom';
import { ActivityIndicator } from '@nativescript-community/ui-activityindicator';
import { BottomAccessory, BottomNavigation as NativeBottomNavigation, BottomSearchContent } from '@nativescript-community/ui-bottom-navigation';
import { BottomNavigationBar as NativeBottomNavigationBar, BottomNavigationTab } from '@nativescript-community/ui-bottomnavigationbar';
import { Button } from '@nativescript-community/ui-button';
import { Card } from '@nativescript-community/ui-card';
import { Surface } from '@nativescript-community/ui-surface';
import { CheckBox } from '@nativescript-community/ui-checkbox';
import { TabContentItem, TabStrip, TabStripItem } from '@nativescript-community/ui-core-tabs';
import { FloatingActionButton } from '@nativescript-community/ui-floatingactionbutton';
import { Progress } from '@nativescript-community/ui-progress';
import { RefreshLayout as NativeRefreshLayout } from '@nativescript-community/ui-refreshlayout';
import { SearchBar } from '@nativescript-community/ui-searchbar';
import { SegmentedBar as NativeSegmentedBar, SegmentedBarItem } from '@nativescript-community/ui-segmentedbar';
import { Slider } from '@nativescript-community/ui-slider';
import { Switch } from '@nativescript-community/ui-switch';
import { Tabs as NativeTabs } from '@nativescript-community/ui-tabs';
import { Toolbar } from '@nativescript-community/ui-toolbar';
import { TextField } from '@nativescript-community/ui-textfield';
import { TextView } from '@nativescript-community/ui-textview';

import BottomNavigation from './BottomNavigation.svelte';
import BottomNavigationBar from './BottomNavigationBar.svelte';
import BottomSheet from './BottomSheet.svelte';
import Buttons from './Buttons.svelte';
import CheckBoxes from './CheckBoxes.svelte';
import CardsSurfaces from './CardsSurfaces.svelte';
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
import AppBars from './AppBars.svelte';
import Toolbars from './Toolbars.svelte';
import Tabs from './Tabs.svelte';
import TextFields from './TextFields.svelte';
import '../app.scss';

installMixins();
installGestureHandler();

// svelte-native `navigate` needs a PageElement: this one wraps an AppPage instead of the core Page
class AppPageElement extends PageElement {
    constructor() {
        super();
        const page = new AppPage();
        (page as any).__SvelteNativeElement__ = this;
        (this as any)._nativeElement = page;
    }
}
registerElement('AppPage', () => new AppPageElement());
installBottomSheet();
export function installPlugin() {
    // each component is a NativeScript view: registering it for svelte-native is one line
    CollectionViewPlugin.register();
    registerNativeViewElement('uiactivityindicator', () => ActivityIndicator);
    registerNativeViewElement('uibottomnavigation', () => NativeBottomNavigation);
    registerNativeViewElement('uibottomaccessory', () => BottomAccessory);
    registerNativeViewElement('uibottomsearchcontent', () => BottomSearchContent);
    registerNativeViewElement('uibottomnavigationbar', () => NativeBottomNavigationBar);
    registerNativeViewElement('uibottomnavigationtab', () => BottomNavigationTab);
    registerNativeViewElement('uibutton', () => Button);
    registerNativeViewElement('uicard', () => Card);
    registerNativeViewElement('uisurface', () => Surface);
    registerNativeViewElement('uicheckbox', () => CheckBox);
    registerNativeViewElement('uifloatingactionbutton', () => FloatingActionButton);
    registerNativeViewElement('uiprogress', () => Progress);
    registerNativeViewElement('uirefreshlayout', () => NativeRefreshLayout);
    registerNativeViewElement('uisearchbar', () => SearchBar);
    registerNativeViewElement('uisegmentedbar', () => NativeSegmentedBar);
    registerNativeViewElement('uisegmentedbaritem', () => SegmentedBarItem as any);
    registerNativeViewElement('uislider', () => Slider);
    registerNativeViewElement('uiswitch', () => Switch);
    registerNativeViewElement('uitabs', () => NativeTabs);
    registerNativeViewElement('uitabstrip', () => TabStrip);
    registerNativeViewElement('uitabstripitem', () => TabStripItem);
    registerNativeViewElement('uitabcontentitem', () => TabContentItem);
    registerNativeViewElement('uitoolbar', () => Toolbar);
    registerNativeViewElement('uitextfield', () => TextField);
    registerNativeViewElement('uitextview', () => TextView);
}

export const demos = [
    { name: 'Buttons', path: 'Buttons', component: Buttons },
    { name: 'Floating action buttons', path: 'FloatingActionButtons', component: FloatingActionButtons },
    { name: 'Text fields', path: 'TextFields', component: TextFields },
    { name: 'Toolbar', path: 'Toolbars', component: Toolbars },
    { name: 'Cards and surfaces', path: 'CardsSurfaces', component: CardsSurfaces },
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
    { name: 'Snackbar', path: 'Snackbar', component: Snackbar },
    { name: 'App bar', path: 'AppBars', component: AppBars }
];
