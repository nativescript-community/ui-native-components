# @nativescript-community/ui-core

Shared code of the components: theming, CSS properties, mixins and helpers.

| Android | iOS |
|---|---|
| Material 3 theme colors | UIKit helpers |

## Installation

```bash
npm install @nativescript-community/ui-core
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```ts
import { installMixins } from '@nativescript-community/ui-core';
installMixins(); // adds the Material only properties to every View: elevation, rippleColor, shape...
```

## API

| Export | |
|---|---|
| `installMixins()`, `themer` | Material only view properties (no-op on iOS) and the theme colors |
| `cssProperty` | decorator to declare CSS properties |
| `/formatted-text` | `createNativeFormattedText`, `renderFormattedTextToImageSource`: spans to `SpannableString`/`NSAttributedString` and to icons. Uses `@nativescript-community/text` when it is installed (optional) |
| `/border-background` | `applyBorderBackground`: border and radius for controls whose core discards the background |
| `/button-variant`, `/ios-button-configuration` | button variants and `UIButton.Configuration` helpers |

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
