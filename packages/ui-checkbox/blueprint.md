{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-checkbox-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-checkbox-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| `MaterialCheckBox` | `UIButton` + SF Symbols |

## Installation

```bash
npm install @nativescript-community/ui-checkbox
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<CheckBox text="Select all" checked="true" indeterminate="false" checkedChange="{{ onChange }}" />
```

## API

| Property | |
|---|---|
| `text` | label |
| `checked`, `indeterminate` | state. A tap clears `indeterminate` |
| `checkedColor` (CSS `checked-color`) | color of the checked box |
| event `checkedChange` | raised when the user toggles |

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
