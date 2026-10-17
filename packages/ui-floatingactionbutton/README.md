# @nativescript-community/ui-floatingactionbutton

Floating action button. Material 3 `FloatingActionButton` on Android, a capsule button with Liquid Glass (`UIButton.Configuration`) on iOS.

| Android | iOS |
|---|---|
| `FloatingActionButton` | `UIButton.Configuration` |

## Installation

```bash
npm install @nativescript-community/ui-floatingactionbutton
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<FloatingActionButton src="res://ic_add" size="normal" />
```

## API

| Property | |
|---|---|
| `src` / `imageSource` | icon (`sys://` SF Symbol on iOS) |
| `size` | `mini`, `normal`, `auto`. Android: `fabSize`, `fabCustomSize` |
| `variant` | iOS button variants, default `prominentGlass` |
| `expanded`, `show()`, `hide()` | |
| `color`, `elevation`, `rippleColor` | Material only (Android) |

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
