# @nativescript-community/ui-snackbar

Snackbars. Material 3 `Snackbar` on Android. A no-op on iOS (the HIG has no snackbar: use an alert or a banner of your own).

| Android | iOS |
|---|---|
| `Snackbar` | no-op |

## Installation

```bash
npm install @nativescript-community/ui-snackbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```ts
import { showSnack } from '@nativescript-community/ui-snackbar';
showSnack({ message: 'Saved', actionText: 'Undo' }).then((result) => {});
```

## API

See `SnackBarOptions` in the typings: `message`, `actionText`, `hideDelay`, `textColor`, `backgroundColor`, `actionTextColor`...

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
