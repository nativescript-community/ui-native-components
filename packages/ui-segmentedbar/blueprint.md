{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-segmentedbar-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-segmentedbar-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| `MaterialButtonToggleGroup` | `UISegmentedControl` |

## Installation

```bash
npm install @nativescript-community/ui-segmentedbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<SegmentedBar selectedIndex="0">
    <SegmentedBarItem title="Day" />
    <SegmentedBarItem src="sys://list.bullet" />
</SegmentedBar>
```

## API

Same API as the core `SegmentedBar`, and `SegmentedBar` adds:

| Property | |
|---|---|
| `apportionsSegmentWidthsByContent` | `true` (default): a segment is as wide as its content. `false`: all the segments are as wide as the widest. With an explicit `width` on the bar, the extra width is shared between the segments |

`SegmentedBarItem` adds:

| Property | |
|---|---|
| `src` | icon: file, resource, url, `font://`, `sys://` (SF Symbol), an ImageSource or a FormattedString (spans drawn into an icon) |
| `formattedText` | spans. On iOS they are drawn as an image (`UISegmentedControl` only shows plain titles). Uses `@nativescript-community/text` when installed (optional) |
| `width` | width of the segment in dip. Automatic (the width of the content) when not set |

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
