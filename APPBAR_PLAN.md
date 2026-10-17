# App bar plan (`@nativescript-community/ui-appbar`)

Goal: one cross platform "app bar" for a NativeScript `Page`, with the same API on both platforms and room for
platform specific features. Not identical behavior: Material top app bar on Android, native `UINavigationBar` (blur / Liquid Glass) on iOS.

## 1. What core gives us today (investigated)

| Topic | Android | iOS |
|---|---|---|
| Native view | `androidx.appcompat.widget.Toolbar`, put in row 0 of the page `GridLayout` (rows auto / star) | none: the `Frame` is a `UINavigationController`, the ActionBar only configures the shared `UINavigationBar` and the page `navigationItem` in `update()` |
| Scrolling behavior | none (page is a `GridLayout`, not a `CoordinatorLayout`) | native (large title collapse, scroll edge effect) as soon as the page has a scroll view that UIKit can find |
| Insets / edge to edge | none: ActionBar ignores window insets (demo patches `Page.onLoaded` to pad the toolbar) | handled by UIKit |
| Custom title | `titleView` supported | `titleView` supported |
| Items | `ActionItem`: text, icon (incl. font icons), `actionView`, `android.position` | `UIBarButtonItem`: text, icon, system icon, `actionView` as `customView` |
| Not supported | spans, subtitle, menus / submenus, search, badges, large / collapsing title | spans, subtitle (iOS 26 API), `UIMenu`, `searchController`, toolbar items, grouping, per page appearance |
| Appearance | colors, flat | one `UINavigationBarAppearance` is copied to standard + compact + scrollEdge: so the "blur when scrolled, transparent at top" behavior of UIKit is lost |

Useful facts:

* `page.actionBar = new MyActionBar()` is supported by core (`PageBase.actionBar` setter) and `Page.onLoaded` only creates a default one when none was assigned.
* svelte-native maps `<actionBar>` to the core class, but `registerNativeViewElement('AppBar', () => AppBar, 'actionBar')` (third argument = parent property, like `navigationButton`) lets us register our own element.
* `ui-collectionview` is a `RecyclerView` / `UICollectionView` with `scroll`, `scrollStart`, `scrollEnd` events and nested scrolling (already used with the bottom sheet). The core `ScrollView` on Android is a plain `ScrollView`: **not** nested scroll aware.
* Material 1.14 (already the repo baseline) has everything needed: `AppBarLayout`, `MaterialToolbar`, `CollapsingToolbarLayout` (medium / large), `liftOnScroll`, scroll flags, `HideViewOnScrollBehavior`, `SearchBar` + `SearchView`, `BottomAppBar`.
* UIKit has the matching native pieces: `prefersLargeTitles`, `navigationItem.searchController`, `largeTitleDisplayMode`, per item `standardAppearance` / `scrollEdgeAppearance`, `setContentScrollView(_:for:)`, `hidesBarsOnSwipe`, `UIBarButtonItem.menu`, `toolbarItems`; iOS 26: `subtitle`, `attributedTitle`, `UIBarButtonItemGroup`, `sharesBackground`, `hidesSharedBackground`, `.prominent` style, scroll edge effects, integrated / bottom search.

## 2. Shared mental model

The bar **overlays** the content, the content scrolls under it and the bar reacts to the scroll:

| Concept | iOS | Android |
|---|---|---|
| `size="large"` | large title (collapses on scroll) | M3 `CollapsingToolbarLayout` large |
| `size="medium"` | large title too (no medium on iOS) | M3 medium collapsing |
| `size="small"` (default) | standard bar | `MaterialToolbar` |
| `scrollBehavior="lift"` | blur appears when content scrolls under | `liftOnScroll` tonal elevation |
| `scrollBehavior="hide"` | `hidesBarsOnSwipe` | scroll flags `scroll\|enterAlways` |
| `translucent` | transparent at top, blur / glass when scrolled | transparent / surface at top |
| search | `navigationItem.searchController` | M3 `SearchBar` + `SearchView` (or classic toolbar `SearchView`) |
| bottom items | `UIToolbar` glass (`toolbarItems`) | `BottomAppBar` |

## 3. Proposed API

```svelte
<page>
  <appBar title="Inbox" subtitle="3 unread" size="large" scrollBehavior="lift" scrollTarget={list}
          navigationIcon="back" on:navigationTap={...}>
    <appBarItem text="Edit" icon="font://..." showAs="ifRoom" on:tap={...} />          <!-- native item -->
    <appBarItem icon="sys://ellipsis" menu={menuItems} on:menuTap={...} />            <!-- UIMenu / PopupMenu (ui-menu) -->
    <appBarItem view={...} />                                                          <!-- any view, e.g. a uibutton -->
    <appBarSearch hint="Search" on:search={...} on:submit={...} />                     <!-- integrated search -->
    <appBarTitle><label formattedText=... /></appBarTitle>                             <!-- custom title view -->
  </appBar>
  <collectionview id="list" ... />
</page>
```

Cross platform props: `title`, `subtitle`, `formattedTitle` / `formattedSubtitle` (spans), `titleView`, `navigationIcon`,
`items`, `size`, `scrollBehavior`, `scrollTarget`, `translucent`, `searchable` + search events, `bottomItems`.

Platform props (namespaced, like `android.position` in core): `android: { scrollFlags, collapsedTitleGravity, liftOnScroll, statusBarForeground, centerTitle }`,
`ios: { largeTitleDisplayMode, hidesBarsOnSwipe, backButtonDisplayMode, searchPlacement, blurStyle }`.

`AppBarItem` props: `text`, `icon` (resource, font icon, `ImageSource`, spans), `view`, `menu`, `badge`, `showAs` (Android),
`variant` = `plain` \| `prominent` (iOS 26 tinted glass / Android filled tonal), `group` (iOS 26 shared glass background).

## 4. Custom titles, spans, buttons from our plugins

* **Custom title view**: keep core `titleView` (works on both platforms), add `<appBarTitle>`.
* **Spans / NSAttributedString**: `formattedTitle` / `formattedSubtitle` through the shared `ui-core` formatted text helpers (optional `@nativescript-community/text`).
  Android: `Toolbar.setTitle(Spannable)`; collapsing title is drawn by `CollapsingToolbarLayout` (colors / styles only, no image spans).
  iOS: `UILabel` attributed text in `titleView`, iOS 26 `attributedTitle` / `attributedSubtitle` (also for large title). Limitation: before iOS 26 the large title can not carry spans.
* **Buttons from our plugins**: two paths.
  1. Native first: `AppBarItem` takes the same props as `ui-button` (`text`, `icon`, `variant`, `menu`) and builds a `MenuItem` / `UIBarButtonItem` (keeps glass morphing, menus, accessibility, no nested views).
  2. Escape hatch: `view={...}` puts any NativeScript view (a `uibutton`, `uifab`, ...) as `actionView` / `customView`. On iOS 26 the system wraps custom views in a glass capsule, so a plain / text variant of the button is advised (documented, `hidesSharedBackground` option).

## 5. Android architecture (the hard part)

Behaviors (collapse, lift, snap, `HideViewOnScrollBehavior`) need a `CoordinatorLayout` ancestor shared by the bar and the scrolling content.
The core page is a `GridLayout`. Options:

| | Idea | + | - |
|---|---|---|---|
| A | `AppBar extends ActionBar` whose native view is a plain Toolbar in a wrapper; scroll driven by us (translation / height from scroll deltas) | no Page change, works with any scroll source | no real snap / fling, we re-implement collapse |
| B | also ship `AppPage extends Page` (`<page>` re-registered) with a `CoordinatorLayout` root, bar = `AppBarLayout`, content = `ScrollingViewBehavior` | all Material behaviors for free (lift, collapse, snap, FAB / snackbar dodging) | content must be nested-scroll aware (`collectionview` yes, core `ScrollView` no), risk with NS layout params in a plain `CoordinatorLayout`, replaces `<page>` |
| C | AppBar reparents the page content into its own coordinator on load | no new Page | fragile, fights Frame / Page internals |

**Decision (accepted)**: custom `AppPage extends Page` (Plan B), with `AppBar` as a thin `ActionBar` subclass. Plan A scroll plumbing stays as the fallback when a core `Page` is used.

### Android root and gesturehandler (verified by a spike)

gesturehandler already replaces the Android page root: `Page.prototype.createNativeView` is monkey patched to return `com.nativescript.gesturehandler.PageLayout`
(a `GridLayout` subclass that dispatches every touch to the `GestureHandlerOrchestrator`), and `applyMixins(Page, [PageGestureExtended])` adds `registry`, `tryCancelAllHandlers`, `initNativeView` / `disposeNativeView`
(`nativeViewProtected.initialize()` / `tearDown()`). Handlers are found with `view.page` -> `page.registry`.
Two libraries can not both be "the root", so **we never create the root**: we nest.

```
root  = super.createNativeView()      // core GridLayout, or gesturehandler PageLayout: whatever is installed (order independent, resolved at call time)
 `- CoordinatorLayout                 // row 1, added by AppPage
     |- AppBarLayout                   // <- the ActionBar Toolbar (core ActionBar unchanged)
     `- ContentLayout + ScrollingViewBehavior  // <- the page content
```

* `nativeViewProtected` stays the gesturehandler `PageLayout`, so `registry`, `initialize()`, `tearDown()` and `tryCancelAllHandlers()` keep working; `AppPage` must call `super.initNativeView()` / `disposeNativeView()`.
* The orchestrator walks the `ViewGroup` tree below the root: handlers attached to views inside the Coordinator work, `requestDisallowInterceptTouchEvent` from the `RecyclerView` still cancels handlers as usual.
* `AppPage` overrides `_addViewToNativeVisualTree` / `_removeViewFromNativeVisualTree`: an `ActionBar` goes in the `AppBarLayout`, anything else in the content container.
* Do not name a private field `_content` (clashes with `ContentView._content`, found by the spike).
* The svelte `<appPage>` element extends `PageElement` (svelte-native `navigate` checks `instanceof PageElement`) and swaps its native element for an `AppPage`.
* iOS: gesturehandler only mixes into `Page`, no root change: `AppPage` is a plain `Page` subclass there.

**Spike result (emulator, Material 1.14, gesturehandler 2.0.45 installed):** the page renders, the `collectionview` scroll drives the `AppBarLayout` (the bar hides with `scroll|enterAlways|snap`),
and a gesturehandler PAN attached to a view of the page still gets its state events. Code: `src/ui-appbar` (`AppPage`), `demo-snippets/svelte/AppBars.svelte`.
Not yet checked: lift on scroll / collapsing toolbar, fling interplay of a PAN with the `AppBarLayout` drag, modals / bottom sheets over an `AppPage`, iOS.

Also on Android: the bar owns the status bar inset (`fitsSystemWindows`, `statusBarForeground`), so the demo patch in `demo-svelte/app/app.ts` goes away.

## 6. Scroll sources and hiding FAB / bottom bars

`ui-core` gets a small `ScrollSource` abstraction: `attach(view)` -> normalized `{ offset, delta, direction, atTop }` events from
`ui-collectionview` (RecyclerView / UICollectionView), core `ScrollView` / `ListView`, any view exposing a native `RecyclerView` / `UIScrollView`.
Consumers:

* `AppBar` (lift / hide / collapse in plan A, iOS `contentScrollView` link),
* `ui-floatingactionbutton` `hideOnScroll` (`hide` \| `shrink`): Android `hide()/show()` or `shrink()/extend()` (with Coordinator: `HideViewOnScrollBehavior`); iOS animated translate / scale (no native FAB),
* `ui-bottomnavigationbar` `hideOnScroll`: Android `HideBottomViewOnScrollBehavior`; iOS already native with `tabBarMinimizeBehavior`.

## 7. iOS architecture

* Subclass `ActionBar`, reuse `navigationItem` of the page view controller; write the **per item** appearances (`navigationItem.standardAppearance`, `scrollEdgeAppearance`, `compactAppearance`) so that blur (`configureWithDefaultBackground`) and transparent-at-top (`configureWithTransparentBackground`) really differ, instead of the core copy of one appearance to all three.
* The `UINavigationBar` is shared by all pages of a frame: bar level settings (`prefersLargeTitles`, `hidesBarsOnSwipe`, tint) are re-applied on `navigatingTo` / `navigatedTo`.
* `scrollTarget` -> `viewController.setContentScrollView(nativeScrollView, for: .top)` so the large title / blur follow the right scroll view, not only "the first subview".
* Search: `navigationItem.searchController` (`UISearchController` wrapper reusing the `ui-searchbar` / `searchContent` ideas of the bottom navigation search tab); iOS 26 placements (stacked / integrated / bottom).
* Bottom items: `viewController.toolbarItems` + `navigationController.setToolbarHidden` (glass on iOS 26).
* Items: `UIBarButtonItem` (text / image / `menu` / `primaryAction`), `UIBarButtonItemGroup` and `sharesBackground` on iOS 26, `.prominent` style, badges.

## 8. Phases

0. **Spikes** (2-3 days), decide A vs B:
   1. `CoordinatorLayout` as page root with NativeScript children (layout params, margins, frame transitions) and `collectionview` nested scrolling with `AppBarLayout`;
   2. iOS per item appearances + `setContentScrollView` with `collectionview` / `scrollview`, shared bar re-apply on push / pop;
   3. `uibutton` as `customView` in the iOS 26 glass bar (double glass? size?).
1. **AppBar basics**: new package `ui-appbar` (`AppBar`, `AppBarItem`, svelte registration), title / subtitle / spans / `titleView`, navigation icon, items (text / icon / font icon / `view` / `menu`), Android edge to edge, iOS appearances (blur / transparent / tint).
2. **Scrolling**: `ScrollSource`, `size` (collapsing / large title), `scrollBehavior` lift / hide, `scrollTarget`.
3. **Search**: iOS `searchController`; Android M3 `SearchBar` / `SearchView` with `searchContent`; shared events.
4. **Hide on scroll for FAB / bottom nav bar**, bottom items (`UIToolbar` / `BottomAppBar`).
5. Demo pages (large title list, search, custom title, custom buttons), READMEs, move the demo patch out; list upstream candidates for core (`ActionBar` insets on Android, per item appearance and `contentScrollView` on iOS, spans / subtitle).

## 9. Risks

* Page / ActionBar internals: core `Page.onLoaded` and `ActionBar.update()` run on every navigation and can overwrite our iOS settings: ordering has to be tested with push / pop / modal / tabs.
* iOS 26 only features (subtitle, groups, prominent, integrated search) need `available` guards and a graceful fallback.
* Large title spans are limited before iOS 26; collapsing title spans are limited on Android (no image spans).
* Core `ScrollView` on Android does not nested scroll: Plan B needs `collectionview` (or a nested aware scroll view) for collapsing.
* Frame fragment transitions with a `CoordinatorLayout` root (Plan B).

## 10. Decisions needed

1. ~~AppPage~~ accepted (Plan B, nested in the gesturehandler root).
2. Android search: M3 `SearchBar` / `SearchView` (expanding overlay) or classic collapsible toolbar `SearchView`?
3. Frameworks to cover besides svelte (vue / angular / react registration)?
4. Package: one `ui-appbar` (bar + items + search), with `ScrollSource` in `ui-core`: fine?
