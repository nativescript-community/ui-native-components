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

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
