{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

Shared base classes and helpers of the other `ui-*` packages: it draws nothing itself, see their screenshots.

{{ template:toc }}

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

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
