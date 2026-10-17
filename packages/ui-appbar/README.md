# @nativescript-community/ui-appbar

App bar and page that react to the scrolling content.

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

| property | |
|---|---|
| `size` | `small` (default), `medium`, `large`: title that collapses with the scroll |
| `scrollBehavior` | `none`, `lift` (elevation / separator only when content scrolls under the bar), `hide` (the whole bar, also a large one, leaves the screen when scrolling down and comes back when scrolling up) |
| `subtitle`, `formattedTitle` | subtitle, title with spans |
| `translucent` | the content scrolls under the bar, which is see through: iOS a blur tinted with the color of the bar, Android the color of the bar at 85%. Set `scrollTarget`; the scrolling view must be the content of the page (iOS) |
| `searchable`, `searchHint` | search: iOS `UISearchController` under the title, Android a collapsible `SearchView` action. Events `searchChange`, `searchSubmit`, `searchCancel` (`text`) |
| `searchMode` | Android: `collapsible` (default, a search icon in the bar) or `bar` (Material 3 `SearchBar` under the title which opens a full screen `SearchView`; its suggestions / results go in `<appPageSearchContent>`, a child of the page) |
| `scrollTarget` | the scrolling view the bar follows (iOS: `setContentScrollView`) |

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

A view inside the item is its `actionView`: use our components in the bar. The view gets its own `tap` event.
On iOS 26 the system puts it in a Liquid Glass capsule, use a plain / text variant of the button.

```svelte
<appBarItem ios.position="right" android.position="actionBar">
  <uibutton text="Go" variant="text" on:tap={go} />
</appBarItem>
```

## Bottom items

`bottomItems` (`{ text, icon, spacer, onTap }`, event `bottomItemTap`): iOS the bottom toolbar of the navigation controller (Liquid Glass buttons on iOS 26, `spacer` is a flexible space), Android a Material `BottomAppBar` (with `scrollBehavior="hide"` it hides on scroll; the actions are at the start, `spacer` is ignored).
The last items of the `scrollTarget` stay above the Android bar.

```svelte
<appBar bottomItems={[{ icon: 'sys://house', text: 'Home', onTap }, { spacer: true }, { icon: 'sys://plus', text: 'Add', onTap }]} />
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
