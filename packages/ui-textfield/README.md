# @nativescript-community/ui-textfield

TextField with Material features on Android (floating label, helper, error, counter, variants) and the native `UITextField` on iOS.

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

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
