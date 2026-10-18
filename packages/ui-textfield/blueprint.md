{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-textfield-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-textfield-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| `TextInputLayout` (Material 3) | `UITextField` |

## Installation

```bash
npm install @nativescript-community/ui-textfield
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<TextField hint="Email" variant="outline" helper="we never share it" keyboardType="email" />
```

## API

| Property | |
|---|---|
| `variant` | `filled`, `outline`, `underline`, `none` (Android) |
| `helper`, `helperColor`, `error`, `errorColor`, `counterMaxLength`, `floating`, `strokeColor`... | Material only (Android), no-op on iOS |
| `digits`, `secureWithoutAutofill`, `closeOnReturn`, `requestFocus()`, `clearFocus()` | both platforms |
| `formattedHint` | spans for the hint. Android: the floating label is plain text, use `floating="false"` for the spans. Uses `@nativescript-community/text` when installed (optional) |
| `formattedText` | spans for the content (core property) |

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
