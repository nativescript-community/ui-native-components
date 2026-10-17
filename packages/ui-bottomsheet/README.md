# @nativescript-community/ui-bottomsheet

Modal bottom sheets for any view: Material `BottomSheetDialogFragment` on Android, native `UISheetPresentationController` on iOS.

| Android | iOS |
|---|---|
| `BottomSheetBehavior` | `UISheetPresentationController` (custom detents on iOS 16+) |

## Installation

```bash
npm install @nativescript-community/ui-bottomsheet
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```ts
import { install } from '@nativescript-community/ui-bottomsheet';
install(); // adds showBottomSheet()/closeBottomSheet() to every View

view.showBottomSheet({
    view: MyContent,
    detents: ['content', 'large'],
    onDetentChange: (index) => console.log(index)
});
```
For svelte-native use the helpers of `@nativescript-community/ui-bottomsheet/svelte`:
```ts
import { showBottomSheet, closeBottomSheet } from '@nativescript-community/ui-bottomsheet/svelte';
const result = await showBottomSheet({ view: MyContent, props: { title: 'Hello' }, detents: [150, 'medium', 'large'] });
```

## API

Options of `showBottomSheet`:

| Option | |
|---|---|
| `view`, `context`, `closeCallback`, `animated` | the content and its result |
| `detents` | heights the sheet rests at, smallest first: `'content'`, `'medium'`, `'large'`, a number (dip) or `{ fraction }`. iOS: any number. Android: up to 3 stops (collapsed, half expanded, expanded) |
| `initialDetentIndex`, `onDetentChange(index)`, `view.setBottomSheetDetentIndex(i)` | detent control |
| `largestUndimmedDetentIndex` | no dim (and, on iOS, touches go through) up to this detent |
| `onWillDismiss()` (return `false` to prevent), `onDismissAttempt()` | veto of the user dismissal. Android cannot veto the drag down: use `dismissOnDraggingDownSheet: false` |
| `dismissOnBackgroundTap`, `dismissOnDraggingDownSheet`, `dismissOnBackButton` | dismissal |
| `grabber`, `cornerRadius`, `transparent`, `backgroundOpacity`, `disableDimBackground`, `canTouchBehind` | look |
| `peekHeight`, `skipCollapsedState` | legacy: use `detents` |
| `scrollExpands`, `edgeAttachedInCompactHeight` | iOS only |
| `trackingScrollView`, `windowSoftInputMode` | Android only |

A scrollable content (`ScrollView`, `ListView`, `@nativescript-community/ui-collectionview`) scrolls before the sheet moves on both platforms.

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
