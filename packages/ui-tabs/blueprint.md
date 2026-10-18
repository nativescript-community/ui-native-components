{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-tabs-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-tabs-android.png" height="500" /> |

{{ template:toc }}

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

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
