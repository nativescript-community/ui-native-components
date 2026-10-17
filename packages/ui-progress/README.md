# @nativescript-community/ui-progress

Linear progress. Material 3 `LinearProgressIndicator` on Android, native `UIProgressView` on iOS (a spinner when `indeterminate`).

| Android | iOS |
|---|---|
| `LinearProgressIndicator` | `UIProgressView` / `UIActivityIndicatorView` |

## Installation

```bash
npm install @nativescript-community/ui-progress
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<Progress value="60" maxValue="100" progressColor="#6750a4" />
<Progress indeterminate="true" busy="true" />
```

## API

| Property | |
|---|---|
| `value`, `maxValue` | core properties |
| `indeterminate`, `busy` | indeterminate mode. iOS swaps the bar for a spinner |
| `progressColor`, `progressBackgroundColor` (CSS `progress-color`, `progress-background-color`) | colors |
| `trackCornerRadius` | Android |

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
