{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-progress-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-progress-android.png" height="500" /> |

{{ template:toc }}

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

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
