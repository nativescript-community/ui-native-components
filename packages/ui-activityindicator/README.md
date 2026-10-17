# @nativescript-community/ui-activityindicator

Material circular progress on Android, native `UIActivityIndicatorView` on iOS.

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

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
