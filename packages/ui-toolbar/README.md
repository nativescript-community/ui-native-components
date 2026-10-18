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
<h1 align="center">@nativescript-community/ui-toolbar</h1>
<p align="center">
		<a href="https://npmcharts.com/compare/@nativescript-community/ui-toolbar?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@nativescript-community/ui-toolbar.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/@nativescript-community/ui-toolbar"><img alt="NPM Version" src="https://img.shields.io/npm/v/@nativescript-community/ui-toolbar.svg" height="20"/></a>
	</p>

<p align="center">
  <b>Toolbar with a title, a navigation icon, action items and an overflow menu: Material 3 MaterialToolbar on Android, UINavigationBar (glass bar buttons on iOS 26) on iOS.</b></br>
  <sub><sub>
</p>

<br />


| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-toolbar-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-toolbar-android.png" height="500" /> |


[](#table-of-contents)

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [API](#api)
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

| Android | iOS |
|---|---|
| Material 3 `MaterialToolbar` | `UINavigationBar` used as a view: its bar buttons are in Liquid Glass capsules on iOS 26 |


[](#installation)

## Installation

```bash
npm install @nativescript-community/ui-toolbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.


[](#usage)

## Usage

```xml
<GridLayout rows="auto,*">
    <Toolbar title="Inbox" subtitle="3 unread" navigationIcon="sys://chevron.left" items="items" navigationTap="onBack" itemTap="onItem" />
    <!-- the content -->
</GridLayout>
```
```ts
const items = [
    { id: 'search', title: 'Search', icon: 'sys://magnifyingglass', androidIcon: 'res://ic_search' },
    { id: 'font', title: 'Font icon', icon: 'font://' },
    { id: 'settings', title: 'Settings', showAsAction: 'never' }
];
```


[](#api)

## API

| Property | |
|---|---|
| `title`, `subtitle` | the title (centered on iOS, `centerTitle` on Android) |
| `navigationIcon` | icon at the start: back, menu, close... |
| `items` | the actions (below) |
| `color` | color of the title and of the icons |
| `background-color` | background of the bar. Android: `colorSurface` by default |
| events `navigationTap`, `itemTap` (`event.item`) | |

An item: `id`, `title`, `icon`, `androidIcon`, `iosIcon`, `showAsAction` (`always`, `ifRoom`, `never`), `disabled`, `onTap`.
`showAsAction: 'never'` puts the item in the overflow menu (the `ellipsis` button on iOS).

An icon can be:
* `res://name` or a file path
* `sys://name`: an SF Symbol (iOS)
* `font://code`: a glyph of the `font-family` of the toolbar (a template image on iOS, tinted by the bar)
* an `ImageSource`
* a `FormattedString` (spans, with `@nativescript-community/text` when it is installed): drawn into an icon that keeps the colors of its spans


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
