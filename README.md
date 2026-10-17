# NativeScript UI Native Components

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%20v2-yellow.svg)](https://opensource.org/license/apache-2-0/)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![lerna--lite](https://img.shields.io/badge/maintained%20with-lerna--lite-e137ff)](https://github.com/lerna-lite/lerna-lite)

NativeScript components with the same API on every platform, each using the platform's own design system:

* **Android**: Material 3 (Material Components)
* **iOS**: native UIKit, with Liquid Glass on iOS 26+ and fallbacks before, following the Apple Human Interface Guidelines

Features that only exist in one design system (ripple, elevation, shape, floating labels...) are Android only properties and are ignored on iOS.

## Packages

Each package is independent: install only what you use.

| Package | |
|---|---|
| [`@nativescript-community/ui-activityindicator`](packages/ui-activityindicator) | Circular progress / activity indicator |
| [`@nativescript-community/ui-bottom-navigation`](packages/ui-bottom-navigation) | Bottom navigation with content |
| [`@nativescript-community/ui-bottomnavigationbar`](packages/ui-bottomnavigationbar) | Bottom navigation bar (no content) |
| [`@nativescript-community/ui-bottomsheet`](packages/ui-bottomsheet) | Bottom sheets with detents |
| [`@nativescript-community/ui-button`](packages/ui-button) | Button: variants (Material and Liquid Glass), role, icon, busy |
| [`@nativescript-community/ui-card`](packages/ui-card) | Card for content (no glass on iOS) |
| [`@nativescript-community/ui-checkbox`](packages/ui-checkbox) | Checkbox with indeterminate state |
| [`@nativescript-community/ui-core`](packages/ui-core) | Shared theming, CSS properties and helpers |
| [`@nativescript-community/ui-core-tabs`](packages/ui-core-tabs) | Tab strip elements shared by Tabs and BottomNavigation |
| [`@nativescript-community/ui-datetimepicker`](packages/ui-datetimepicker) | Date, time and date range pickers |
| [`@nativescript-community/ui-dialogs`](packages/ui-dialogs) | alert, confirm, prompt, login, action |
| [`@nativescript-community/ui-floatingactionbutton`](packages/ui-floatingactionbutton) | Floating action button |
| [`@nativescript-community/ui-menu`](packages/ui-menu) | Popup and context menus |
| [`@nativescript-community/ui-progress`](packages/ui-progress) | Linear progress |
| [`@nativescript-community/ui-refreshlayout`](packages/ui-refreshlayout) | Pull to refresh, top and bottom (chat ready) |
| [`@nativescript-community/ui-searchbar`](packages/ui-searchbar) | Search bar |
| [`@nativescript-community/ui-segmentedbar`](packages/ui-segmentedbar) | Segmented control with icons and spans |
| [`@nativescript-community/ui-slider`](packages/ui-slider) | Slider |
| [`@nativescript-community/ui-snackbar`](packages/ui-snackbar) | Snackbar (Android) |
| [`@nativescript-community/ui-surface`](packages/ui-surface) | Floating surface for toolbars and action groups (Liquid Glass) |
| [`@nativescript-community/ui-switch`](packages/ui-switch) | Switch |
| [`@nativescript-community/ui-tabs`](packages/ui-tabs) | Top tabs |
| [`@nativescript-community/ui-textfield`](packages/ui-textfield) | Text field |
| [`@nativescript-community/ui-textview`](packages/ui-textview) | Text view |

## Installation

```bash
npm install @nativescript-community/ui-button   # any package of the list
```

### Android
The components use **Material 3**. Your Android theme must inherit from a `Theme.Material3` theme: in `App_Resources/Android/src/main/res/values/styles.xml` replace `Theme.AppCompat` / `Theme.MaterialComponents` with `Theme.Material3.DayNight.NoActionBar` (see `demo-svelte`).
The Material Components version is `1.12.0` by default, set the `androidXMaterial` gradle property to change it.

### iOS
Nothing to install: the components use UIKit. No CocoaPods.

### Production build
With proguard on Android you must keep the resources of the plugins: add `tools:keep="@layout/ns_*"` as explained [here](https://developer.android.com/build/shrink-code#keep-resources).

## Usage

The components are regular NativeScript views: use them in XML, in code or in your framework.

```xml
<Button text="Save" variant="contained" />
```

### svelte-native
Register the elements you use, once, at startup (`registerNativeViewElement` comes from `@nativescript-community/svelte-native/dom`):

```ts
import { Button } from '@nativescript-community/ui-button';
import { Switch } from '@nativescript-community/ui-switch';
registerNativeViewElement('uibutton', () => Button);
registerNativeViewElement('uiswitch', () => Switch);
```

### Optional dependencies
`@nativescript-community/text` is **optional**. When it is installed the spans (`formattedText`, `formattedHint`...) of the components use it, else the spans of NativeScript core.

## Demo

`demo-svelte` (with the pages of `demo-snippets/svelte`) shows every component:

```bash
yarn install
yarn build                  # builds every package
yarn demo.svelte.android    # or yarn demo.svelte.ios
```

## Development

* sources are in `src/ui-*`, the packages in `packages/ui-*` are their build output
* each package has `index.android.ts`, `index.ios.ts`, `index.d.ts` and `index-common.ts`
* `ui-core` and `ui-core-tabs` must be built first (`yarn build` takes care of the order)
* see [NATIVE_COMPONENTS_PLAN.md](NATIVE_COMPONENTS_PLAN.md) for the design decisions and the status

## Contributing

Issues and pull requests are welcome on [https://github.com/nativescript-community/ui-native-components](https://github.com/nativescript-community/ui-native-components).

## License

Apache-2.0
