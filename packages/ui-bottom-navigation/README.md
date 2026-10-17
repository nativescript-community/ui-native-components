# @nativescript-community/ui-bottom-navigation

Bottom navigation with content: Material 3 `NavigationBarView` on Android, `UITabBarController` (floating Liquid Glass tab bar on iOS 26) on iOS.

| Android | iOS |
|---|---|
| `NavigationBarView` + `ViewPager` | `UITabBarController` |

## Installation

```bash
npm install @nativescript-community/ui-bottom-navigation
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

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

## API

Same API as the NativeScript `BottomNavigation` (`selectedIndex`, `selectedIndexChanged`, `TabStrip`, `TabStripItem`, `TabContentItem`).
`TabStrip`, `TabStripItem` and `TabContentItem` come from `@nativescript-community/ui-core-tabs` and must be registered too in svelte-native (`uitabstrip`, `uitabstripitem`, `uitabcontentitem`).
`TabStripItem` labels support spans (`formattedText`).

## iOS 26 features

The tab bar of iOS 26 minimizes on scroll, can host an accessory and a search tab. They are ignored on Android and, for the accessory and the minimize behavior, before iOS 26.

```xml
<BottomNavigation minimizeBehavior="onScrollDown" searchTab="true" searchHint="Search" search="{{ onSearch }}" searchSubmit="{{ onSubmit }}">
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

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
