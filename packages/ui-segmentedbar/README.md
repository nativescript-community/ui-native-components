# @nativescript-community/ui-segmentedbar

Segmented control with icons and spans. Material 3 segmented buttons on Android, native `UISegmentedControl` on iOS.

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

Same API as the core `SegmentedBar`, and `SegmentedBarItem` adds:

| Property | |
|---|---|
| `src` | icon: file, resource, url, `font://`, `sys://` (SF Symbol), an ImageSource or a FormattedString (spans drawn into an icon) |
| `formattedText` | spans. On iOS they are drawn as an image (`UISegmentedControl` only shows plain titles). Uses `@nativescript-community/text` when installed (optional) |

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
