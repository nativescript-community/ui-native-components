# @nativescript-community/ui-tabs

Top tabs with swipeable content. Material 3 `TabLayout` + `ViewPager2` on Android, a segmented control + `UIPageViewController` on iOS.

| Android | iOS |
|---|---|
| `TabLayout` + `ViewPager2` | `UISegmentedControl` + `UIPageViewController` |

## Installation

```bash
npm install @nativescript-community/ui-tabs
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<Tabs selectedIndex="0">
    <TabStrip>
        <TabStripItem><Label text="Home" /></TabStripItem>
        <TabStripItem><Label text="Search" /></TabStripItem>
    </TabStrip>
    <TabContentItem><GridLayout><Label text="Home" /></GridLayout></TabContentItem>
    <TabContentItem><GridLayout><Label text="Search" /></GridLayout></TabContentItem>
</Tabs>
```

## API

Same API as the NativeScript `Tabs` (`selectedIndex`, `selectedIndexChanged`, `swipeEnabled`, `offscreenTabLimit`...). `TabStripItem` labels support spans (`formattedText`).
In svelte-native register `uitabs` and the elements of `ui-core-tabs`.

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
