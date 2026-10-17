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
| `scrollBehavior` | `none`, `lift` (elevation / separator only when content scrolls under the bar), `hide` (leaves the screen when scrolling) |
| `subtitle`, `formattedTitle` | subtitle, title with spans |
| `translucent` | the content goes under the bar |
| `searchable`, `searchHint` | search: iOS `UISearchController` under the title, Android a collapsible `SearchView` action. Events `searchChange`, `searchSubmit`, `searchCancel` (`text`) |
| `scrollTarget` | the scrolling view the bar follows (iOS: `setContentScrollView`) |

Status and limits: see [APPBAR_PLAN.md](../../APPBAR_PLAN.md). On iOS a large title on a pushed page does not show the inline title once collapsed (UIKit `Always` mode); on the root page of the Frame it does.
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

Android known limit: while a medium / large bar is expanded the page content is taller than the screen (`ScrollingViewBehavior`): a view anchored to the bottom of the page content (a FAB) is off screen until the bar collapses.
