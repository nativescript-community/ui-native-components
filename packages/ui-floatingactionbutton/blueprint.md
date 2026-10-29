{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-floatingactionbutton-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-floatingactionbutton-android.png" height="500" /> |

{{ template:toc }}

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
| `hideOnScroll`, `shrinkOnScroll` | the scrolling view (collectionview...): `hideOnScroll` hides the button when the content scrolls down, `shrinkOnScroll` collapses an extended button to its icon (Android) and extends it again when scrolling up or at the top |
| `color`, `elevation`, `rippleColor` | Material only (Android) |

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
