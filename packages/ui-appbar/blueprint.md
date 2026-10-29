{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-appbar-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-appbar-android.png" height="500" /> |

{{ template:toc }}

## Installation

```bash
npm install @nativescript-community/ui-appbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

| | Android | iOS |
|---|---|---|
| `AppPage` | Page whose content is in a `CoordinatorLayout` (nested in the Page root: compatible with gesturehandler) | regular Page |
| `AppBar` | `MaterialToolbar` in an `AppBarLayout`, M3 `CollapsingToolbarLayout` for `medium` / `large` | the navigation bar (Liquid Glass buttons on iOS 26), large title |

```svelte
<appPage>
  <appBar title="Inbox" subtitle="3 unread" size="large" scrollBehavior="lift" />
  <collectionview ... />
</appPage>
```

Register the svelte elements once (`registerElement` of svelte-native): `import { register } from '@nativescript-community/ui-appbar/svelte'; register();`.

## API

| property | |
|---|---|
| `size` | `small` (default), `medium`, `large`: title that collapses with the scroll |
| `scrollBehavior` (Android notes: the surface of the bar is the AppBarLayout, the toolbar is flat and transparent; the icons follow the css `color`, the surface the css `background-color`, else the theme colors; `lift` changes the surface color and the status bar area follows) | `none`, `lift` (elevation / separator only when content scrolls under the bar), `hide` (the whole bar, also a large one, leaves the screen when scrolling down and comes back when scrolling up) |
| `subtitle`, `formattedTitle` | subtitle, title with spans |
| `translucent` | the content scrolls under the bar, which is see through: iOS a blur tinted with the color of the bar, Android the color of the bar at 85%. Set `scrollTarget`; the scrolling view must be the content of the page (iOS) |
| `searchable`, `searchHint` | search: iOS `UISearchController` under the title, Android a collapsible `SearchView` action. Events `searchChange`, `searchSubmit`, `searchCancel` (`text`) |
| `searchMode` | Android: `collapsible` (default, a search icon in the bar) `bar` (Material 3 `SearchBar` under the title which opens a full screen `SearchView`; its suggestions / results go in `<appPageSearchContent>`, a child of the page) or `inline` (Material 3 `SearchBar` that morphs into an editable field in place: filter your content from `searchChange`, no full screen view; without a `title` the bar hosts the navigation icon and the actions, `closeSearch()` closes it) |
| `searchPlacement` | iOS 26: where the search bar goes: `stacked` (under the title, default), `integrated` (a glass button / field in the bar), `integratedButton`, `integratedCentered`, `automatic` |
| `scrollTarget`, `scrollTargetId` | the scrolling view the bar follows (iOS: `setContentScrollView`), as a view or by its `id` in the page. By default (Android) the first scrolling view of the content is searched: giving it spares that search |

Status and limits: see [APPBAR_PLAN.md](../../APPBAR_PLAN.md). On iOS a large title on a pushed page uses the UIKit `Always` mode, which never shows the inline title: a title view is shown while the bar is collapsed (the height of the bar tells). On the root page of the Frame UIKit does it.
On Android the bar draws under the status bar (edge to edge) and the page handles the inset.

## Items

`<appBarItem>` is the core `ActionItem` with `menu` (items of `@nativescript-community/ui-menu`: iOS native menu of the bar button, Android popup menu) and `prominent` (iOS 26 tinted glass).

```svelte
<appBar title="Inbox">
  <appBarItem text="More" icon="sys://ellipsis" menu={[{ title: 'Share', onSelect }, { separator: true }, { title: 'Delete', destructive: true }]} />
  <appBarItem text="Edit" prominent />
</appBar>
```

## Hide on scroll

`hideOnScroll` (the scrolling view) of `@nativescript-community/ui-floatingactionbutton` and `@nativescript-community/ui-bottomnavigationbar`: hidden when the content scrolls down, shown when it scrolls up.

```svelte
<appPage>
  <appBar searchable searchMode="bar" on:searchChange={(e) => (query = e.text)} />
  <collectionview ... />
  <appPageSearchContent><label text="results for {query}" /></appPageSearchContent>
</appPage>
```
On iOS `searchMode` and `searchContent` are ignored: the `UISearchController` is used, filter the main content from `searchChange`.

`badge` on an item (and on a bottom item): a number, a text or `true` (a dot). Android `BadgeDrawable`, iOS 26 `UIBarButtonItemBadge` (the iOS 26.5 bottom toolbar does not draw it, the navigation bar does).

A view inside the item is its `actionView`: use our components in the bar. The view gets its own `tap` event.
On iOS 26 the system puts it in a Liquid Glass capsule, use a plain / text variant of the button.

```svelte
<appBarItem ios.position="right" android.position="actionBar">
  <uibutton text="Go" variant="text" on:tap={go} />
</appBarItem>
```

## Bottom items

`bottomBarStyle` (Android: `floating`, the default, a Material 3 Expressive floating toolbar over the content, or `bottomAppBar`; iOS ignores it) and `bottomItems` (`{ text, icon, spacer, menu, color, onTap }`, event `bottomItemTap`; `color` tints the button (icon and text) on both platforms, e.g. the error color for a delete action; `menu` makes the button open a menu: iOS native, Android popup above the bar): iOS the bottom toolbar of the navigation controller (Liquid Glass buttons on iOS 26, `spacer` is a flexible space), Android a Material `BottomAppBar` (with `scrollBehavior="hide"` it hides on scroll; the actions are at the start, `spacer` is ignored).
The last items of the `scrollTarget` stay above the Android bar. The icons of the Android bars take the color of the bar (`color` css, else the theme `colorOnSurface`) and follow a dark / light switch.

```svelte
<appBar bottomItems={[{ icon: 'sys://house', text: 'Home', onTap }, { spacer: true }, { icon: 'sys://plus', text: 'Add', onTap }]} />
```

## Custom views (Android)

`<appBarSearchField>` (`searchField`) replaces the built-in text field of the `inline` search by any NativeScript `TextField` (core, or `@nativescript-community/ui-textfield`). The bar puts it between the back and the clear buttons and keeps `searchChange`, `searchSubmit`, the clear button and the keyboard working with it.
`<appBarBottomView>` (`bottomView`) puts any view in the `floating` bottom toolbar instead of the `bottomItems` buttons (`bottomItems` stay the default; the `bottomAppBar` style ignores `bottomView`). Both are ignored on iOS.

```svelte
<appBar searchable searchMode="inline" on:searchChange={(e) => (query = e.text)}>
  <appBarSearchField><textfield hint="Search" /></appBarSearchField>
  <appBarBottomView><stacklayout orientation="horizontal"><button text="Share" /></stacklayout></appBarBottomView>
</appBar>
```

## Overlay

Views anchored to the page itself (a FAB, a bottom bar) go in `<appPageOverlay>`, not in the page content: on Android the content of an `AppPage` is taller than the screen while a medium / large bar is expanded, so a bottom anchored view would be off screen.
On iOS the overlay is laid out over the content, inside the safe area; its empty areas let the touches go through.

```svelte
<appPage>
  <appBar ... />
  <collectionview ... />
  <appPageOverlay>
    <uifloatingactionbutton verticalAlignment="bottom" horizontalAlignment="right" />
  </appPageOverlay>
</appPage>
```

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
