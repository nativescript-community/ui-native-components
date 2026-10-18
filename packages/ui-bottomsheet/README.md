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
<h1 align="center">@nativescript-community/ui-bottomsheet</h1>
<p align="center">
		<a href="https://npmcharts.com/compare/@nativescript-community/ui-bottomsheet?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@nativescript-community/ui-bottomsheet.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/@nativescript-community/ui-bottomsheet"><img alt="NPM Version" src="https://img.shields.io/npm/v/@nativescript-community/ui-bottomsheet.svg" height="20"/></a>
	</p>

<p align="center">
  <b>BottomSheet: showBottomSheet()/closeBottomSheet() on every View. Material on Android, native UISheetPresentationController on iOS.</b></br>
  <sub><sub>
</p>

<br />


| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-bottomsheet-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-bottomsheet-android.png" height="500" /> |


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
| `BottomSheetBehavior` | `UISheetPresentationController` (custom detents on iOS 16+) |


[](#installation)

## Installation

```bash
npm install @nativescript-community/ui-bottomsheet
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.


[](#usage)

## Usage

```ts
import { install } from '@nativescript-community/ui-bottomsheet';
install(); // adds showBottomSheet()/closeBottomSheet() to every View

view.showBottomSheet({
    view: MyContent,
    detents: ['content', 'large'],
    onDetentChange: (index) => console.log(index)
});
```
For svelte-native use the helpers of `@nativescript-community/ui-bottomsheet/svelte`:
```ts
import { showBottomSheet, closeBottomSheet } from '@nativescript-community/ui-bottomsheet/svelte';
const result = await showBottomSheet({ view: MyContent, props: { title: 'Hello' }, detents: [150, 'medium', 'large'] });
```


[](#api)

## API

Options of `showBottomSheet`:

| Option | |
|---|---|
| `view`, `context`, `closeCallback`, `animated` | the content and its result |
| `detents` | heights the sheet rests at, smallest first: `'content'`, `'medium'`, `'large'`, a number (dip) or `{ fraction }`. iOS: any number. Android: up to 3 stops (collapsed, half expanded, expanded) |
| `initialDetentIndex`, `onDetentChange(index)`, `view.setBottomSheetDetentIndex(i)` | detent control |
| `largestUndimmedDetentIndex` | no dim (and, on iOS, touches go through) up to this detent |
| `onWillDismiss()` (return `false` to prevent), `onDismissAttempt()` | veto of the user dismissal. Android cannot veto the drag down: use `dismissOnDraggingDownSheet: false` |
| `dismissOnBackgroundTap`, `dismissOnDraggingDownSheet`, `dismissOnBackButton` | dismissal |
| `grabber`, `cornerRadius`, `transparent`, `backgroundOpacity`, `disableDimBackground`, `canTouchBehind` | look |
| `peekHeight`, `skipCollapsedState` | legacy: use `detents` |
| `scrollExpands`, `edgeAttachedInCompactHeight` | iOS only |
| `trackingScrollView`, `windowSoftInputMode` | Android only |

A scrollable content (`ScrollView`, `ListView`, `@nativescript-community/ui-collectionview`) scrolls before the sheet moves on both platforms.


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
