{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-dialogs-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-dialogs-android.png" height="500" /> |

{{ template:toc }}

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

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
