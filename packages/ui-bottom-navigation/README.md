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
<h1 align="center">@nativescript-community/ui-bottom-navigation</h1>
<p align="center">
		<a href="https://npmcharts.com/compare/@nativescript-community/ui-bottom-navigation?minimal=true"><img alt="Downloads per month" src="https://img.shields.io/npm/dm/@nativescript-community/ui-bottom-navigation.svg" height="20"/></a>
<a href="https://www.npmjs.com/package/@nativescript-community/ui-bottom-navigation"><img alt="NPM Version" src="https://img.shields.io/npm/v/@nativescript-community/ui-bottom-navigation.svg" height="20"/></a>
	</p>

<p align="center">
  <b>BottomNavigation: tabs with a bottom bar and content. Material on Android, native UITabBarController on iOS.</b></br>
  <sub><sub>
</p>

<br />


| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-bottom-navigation-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-bottom-navigation-android.png" height="500" /> |


[](#table-of-contents)

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)
* [API](#api)
* [iOS 26 features](#ios-26-features)
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
| `NavigationBarView` + `ViewPager` | `UITabBarController` |


[](#installation)

## Installation

```bash
npm install @nativescript-community/ui-bottom-navigation
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.


[](#usage)

## Usage

```xml
<BottomNavigation selectedIndex="0">
    <TabStrip>
        <TabStripItem><Label text="Home" /><Image src="sys://house" /></TabStripItem>
        <TabStripItem><Label text="Search" /><Image src="sys://magnifyingglass" /></TabStripItem>
    </TabStrip>
    <TabContentItem><GridLayout><Label text="Home" /></GridLayout></TabContentItem>
    <TabContentItem><GridLayout><Label text="Search" /></GridLayout></TabContentItem>
</BottomNavigation>
```


[](#api)

## API

Same API as the NativeScript `BottomNavigation` (`selectedIndex`, `selectedIndexChanged`, `TabStrip`, `TabStripItem`, `TabContentItem`).
`TabStrip`, `TabStripItem` and `TabContentItem` come from `@nativescript-community/ui-core-tabs` and must be registered too in svelte-native (`uitabstrip`, `uitabstripitem`, `uitabcontentitem`).
`TabStripItem` labels support spans (`formattedText`).


[](#ios-26-features)

## iOS 26 features

The tab bar of iOS 26 minimizes on scroll, can host an accessory and a search tab. They are ignored on Android and, for the accessory and the minimize behavior, before iOS 26.

```xml
<BottomNavigation minimizeBehavior="onScrollDown" searchTab="true" searchHint="Search" search="onSearch" searchSubmit="onSubmit">
    <TabStrip>...</TabStrip>
    <TabContentItem>...</TabContentItem>

    <!-- the results of the search tab -->
    <BottomSearchContent>
        <StackLayout>...</StackLayout>
    </BottomSearchContent>

    <!-- a view above the tab bar (inline with it when it is minimized), any NativeScript view -->
    <BottomAccessory>
        <GridLayout columns="*,auto">...</GridLayout>
    </BottomAccessory>
</BottomNavigation>
```

| Property | |
|---|---|
| `minimizeBehavior` | `automatic`, `never`, `onScrollDown`, `onScrollUp`: the content must scroll (a ScrollView, a ListView, a CollectionView...) |
| `accessory` / `<BottomAccessory>` | a view above the tab bar. It stays interactive |
| `searchTab`, `searchHint` | iOS 18+: adds a search tab at the end. On iOS 26 it is a separate glass button which expands to a search field in the bar |
| `<BottomSearchContent>` | the content of the search tab (the results) |
| events `search`, `searchSubmit` (`event.text`) | the text changed, the keyboard search key |

In svelte-native register `uibottomaccessory` and `uibottomsearchcontent` (`BottomAccessory` and `BottomSearchContent` are exported by the package).


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
