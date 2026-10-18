{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-activityindicator-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-activityindicator-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| `CircularProgressIndicator` (Material 3) | `UIActivityIndicatorView` |

## Installation

```bash
npm install @nativescript-community/ui-activityindicator
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<ActivityIndicator busy="true" width="48" height="48" />
```

## API

| Property | |
|---|---|
| `busy` | shows and animates the indicator (core property) |
| `indeterminate`, `value`, `maxValue` | determinate mode (Android) |
| `color` | color of the indicator |

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
