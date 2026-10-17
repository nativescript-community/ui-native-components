# @nativescript-community/ui-snackbar

Snackbars. Material 3 `Snackbar` on Android, [liquid-toasts](https://github.com/SimplifyJobs/liquid-toasts) on iOS (SwiftUI toast, real Liquid Glass on iOS 26, frosted material on iOS 17+).

| Android | iOS |
|---|---|
| `Snackbar` | liquid-toasts `LiquidToast` (bottom, with optional action button) |

## Installation

```bash
npm install @nativescript-community/ui-snackbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

The iOS Swift package is declared by this plugin `nativescript.config.ts` (`ios.SPMPackages`) and bridged to JS by `platforms/ios/src/NSCLiquidToast.swift`: nothing to configure, but it needs a NativeScript CLI with plugin Swift Package Manager support, and it raises the app iOS deployment target to 17 and `SWIFT_VERSION` to 5 (`platforms/ios/build.xcconfig`). The liquid-toasts repository currently has no license file: check it fits your needs. On iOS `isRTL`, `view` and `anchorView` are ignored.

## Usage

```ts
import { showSnack } from '@nativescript-community/ui-snackbar';
showSnack({ message: 'Saved', actionText: 'Undo' }).then((result) => {});
```

## API

See `SnackBarOptions` in the typings: `message`, `actionText`, `hideDelay`, `textColor`, `backgroundColor`, `actionTextColor`...

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
