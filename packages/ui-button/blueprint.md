{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-button-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-button-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| `MaterialButton` | `UIButton.Configuration` |

## Installation

```bash
npm install @nativescript-community/ui-button
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<Button text="Save" variant="contained" />
<Button text="Delete" role="destructive" />
<Button variant="glass" src="sys://square.and.arrow.up" />
```

## API

| Property | |
|---|---|
| `variant` | Material: `contained`, `flat`, `outline`, `text`. iOS: `prominentGlass`, `glass`, `clearGlass`, `prominentClearGlass`, `filled`, `tinted`, `gray`, `plain`, `bordered`, `borderedTinted`, `borderedProminent`, `borderless`. Each platform maps the names of the other |
| `role` | `normal`, `primary`, `destructive`, `cancel` |
| `src` / `imageSource` | icon: file, resource, url, `font://` or `sys://` (SF Symbol, iOS). On Android `res://` |
| `busy` | shows a spinner and disables the button |
| `elevation`, `rippleColor`, `shape`... | Material only (Android), ignored on iOS |

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
