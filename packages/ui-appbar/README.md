<!-- ⚠️ This README has been generated from the file(s) "blueprint.md" ⚠️-->
<!--  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      DO NOT EDIT THIS READEME DIRECTLY! Edit "bluesprint.md" instead.
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! -->
<h1 align="center">@nativescript-community/ui-appbar</h1>
<p align="center">
		<a href="https://npmcharts.com/compare/@nativescript-community/ui-appbar?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@nativescript-community/ui-appbar.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/@nativescript-community/ui-appbar"><img alt="NPM Version" src="https://img.shields.io/npm/v/@nativescript-community/ui-appbar.svg" height="20"/></a>
	</p>

<p align="center">
  <b>App bar and page: Material top app bar (collapsing, lift on scroll) on Android, native navigation bar on iOS</b></br>
  <sub><sub>
</p>

<br />


| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-appbar-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-appbar-android.png" height="500" /> |


[](#table-of-contents)

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [API](#api)
* [Items](#items)
* [Hide on scroll](#hide-on-scroll)
* [Bottom items](#bottom-items)
* [Overlay](#overlay)
* [Demos and Development](#demos-and-development)
	* [Repo Setup](#repo-setup)
	* [Build](#build)
	* [Demos](#demos)
* [Contributing](#contributing)
	* [Update repo ](#update-repo-)
	* [Update readme ](#update-readme-)
	* [Update doc ](#update-doc-)
	* [Publish](#publish)
	* [modifying submodules](#modifying-submodules)
* [Questions](#questions)


[](#installation)

## Installation

```bash
npm install @nativescript-community/ui-appbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.


[](#usage)

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


[](#api)

## API

| property | |
|---|---|
| `size` | `small` (default), `medium`, `large`: title that collapses with the scroll |
| `scrollBehavior` (Android notes: the surface of the bar is the AppBarLayout, the toolbar is flat and transparent; the icons follow the css `color`, the surface the css `background-color`, else the theme colors; `lift` changes the surface color and the status bar area follows) | `none`, `lift` (elevation / separator only when content scrolls under the bar), `hide` (the whole bar, also a large one, leaves the screen when scrolling down and comes back when scrolling up) |
| `subtitle`, `formattedTitle` | subtitle, title with spans |
| `translucent` | the content scrolls under the bar, which is see through: iOS a blur tinted with the color of the bar, Android the color of the bar at 85%. Set `scrollTarget`; the scrolling view must be the content of the page (iOS) |
| `searchable`, `searchHint` | search: iOS `UISearchController` under the title, Android a collapsible `SearchView` action. Events `searchChange`, `searchSubmit`, `searchCancel` (`text`) |
| `searchMode` | Android: `collapsible` (default, a search icon in the bar) or `bar` (Material 3 `SearchBar` under the title which opens a full screen `SearchView`; its suggestions / results go in `<appPageSearchContent>`, a child of the page) |
| `searchPlacement` | iOS 26: where the search bar goes: `stacked` (under the title, default), `integrated` (a glass button / field in the bar), `integratedButton`, `integratedCentered`, `automatic` |
| `scrollTarget` | the scrolling view the bar follows (iOS: `setContentScrollView`) |

Status and limits: see [APPBAR_PLAN.md](../../APPBAR_PLAN.md). On iOS a large title on a pushed page uses the UIKit `Always` mode, which never shows the inline title: a title view is shown while the bar is collapsed (the height of the bar tells). On the root page of the Frame UIKit does it.
On Android the bar draws under the status bar (edge to edge) and the page handles the inset.


[](#items)

## Items

`<appBarItem>` is the core `ActionItem` with `menu` (items of `@nativescript-community/ui-menu`: iOS native menu of the bar button, Android popup menu) and `prominent` (iOS 26 tinted glass).

```svelte
<appBar title="Inbox">
  <appBarItem text="More" icon="sys://ellipsis" menu={[{ title: 'Share', onSelect }, { separator: true }, { title: 'Delete', destructive: true }]} />
  <appBarItem text="Edit" prominent />
</appBar>
```


[](#hide-on-scroll)

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


[](#bottom-items)

## Bottom items

`bottomItems` (`{ text, icon, spacer, onTap }`, event `bottomItemTap`): iOS the bottom toolbar of the navigation controller (Liquid Glass buttons on iOS 26, `spacer` is a flexible space), Android a Material `BottomAppBar` (with `scrollBehavior="hide"` it hides on scroll; the actions are at the start, `spacer` is ignored).
The last items of the `scrollTarget` stay above the Android bar.

```svelte
<appBar bottomItems={[{ icon: 'sys://house', text: 'Home', onTap }, { spacer: true }, { icon: 'sys://plus', text: 'Add', onTap }]} />
```


[](#overlay)

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


[](#demos-and-development)

## Demos and Development


### Repo Setup

The repo uses submodules. If you did not clone with ` --recursive` then you need to call
```
git submodule update --init
```

The package manager used to install and link dependencies must be `pnpm` or `yarn`. `npm` wont work.

To develop and test:
if you use `yarn` then run `yarn`
if you use `pnpm` then run `pnpm i`

**Interactive Menu:**

To start the interactive menu, run `npm start` (or `yarn start` or `pnpm start`). This will list all of the commonly used scripts.

### Build

```bash
npm run build.all
```
WARNING: it seems `yarn build.all` wont always work (not finding binaries in `node_modules/.bin`) which is why the doc explicitly uses `npm run`

### Demos

```bash
npm run demo.[ng|react|svelte|vue].[ios|android]

npm run demo.svelte.ios # Example
```

Demo setup is a bit special in the sense that if you want to modify/add demos you dont work directly in `demo-[ng|react|svelte|vue]`
Instead you work in `demo-snippets/[ng|react|svelte|vue]`
You can start from the `install.ts` of each flavor to see how to register new demos 


[](#contributing)

## Contributing

### Update repo 

You can update the repo files quite easily

First update the submodules

```bash
npm run update
```

Then commit the changes
Then update common files

```bash
npm run sync
```
Then you can run `yarn|pnpm`, commit changed files if any

### Update readme 
```bash
npm run readme
```

### Update doc 
```bash
npm run doc
```

### Publish

The publishing is completely handled by `lerna` (you can add `-- --bump major` to force a major release)
Simply run 
```shell
npm run publish
```

### modifying submodules

The repo uses https:// for submodules which means you won't be able to push directly into the submodules.
One easy solution is t modify `~/.gitconfig` and add
```
[url "ssh://git@github.com/"]
	pushInsteadOf = https://github.com/
```


[](#questions)

## Questions

If you have any questions/issues/comments please feel free to create an issue or start a conversation in the [NativeScript Community Discord](https://nativescript.org/discord).
