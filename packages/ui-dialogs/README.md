# @nativescript-community/ui-dialogs

`alert`, `confirm`, `prompt`, `login` and `action` with a custom view support. Material 3 dialogs on Android, `UIAlertController` on iOS.

| Android | iOS |
|---|---|
| `MaterialAlertDialog` | `UIAlertController` |

## Installation

```bash
npm install @nativescript-community/ui-dialogs
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```ts
import { alert, confirm, prompt, action } from '@nativescript-community/ui-dialogs';

await alert({ title: 'Saved', message: 'Done', okButtonText: 'OK' });
const ok = await confirm({ message: 'Delete?', okButtonText: 'Delete', cancelButtonText: 'Cancel' });
```

## API

Same API as the NativeScript dialogs, plus a custom `view` (any NativeScript view in the dialog, on iOS through the `contentViewController` key of `UIAlertController`) and the Material options on Android.

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
