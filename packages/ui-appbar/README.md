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
| `scrollTarget` | the scrolling view the bar follows (iOS: `setContentScrollView`) |

Status and limits: see [APPBAR_PLAN.md](../../APPBAR_PLAN.md). On iOS a large title on a pushed page does not show the inline title once collapsed (UIKit `Always` mode); on the root page of the Frame it does.
On Android the bar draws under the status bar (edge to edge) and the page handles the inset.
