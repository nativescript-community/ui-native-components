# @nativescript-community/ui-checkbox

Checkbox with a label and an indeterminate state. Material 3 `MaterialCheckBox` on Android, a toggle button with SF Symbols on iOS (UIKit has no iPhone checkbox).

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

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
