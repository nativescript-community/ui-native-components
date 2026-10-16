# NativeScript UI Native Components

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%20v2-yellow.svg)](https://opensource.org/license/apache-2-0/)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![lerna--lite](https://img.shields.io/badge/maintained%20with-lerna--lite-e137ff)](https://github.com/lerna-lite/lerna-lite)

NativeScript components with the same API on every platform, each using the platform's own design system:

* **Android**: Material Components
* **iOS**: native UIKit (Liquid Glass on iOS 26+), following the Apple Human Interface Guidelines

Material only features (ripple, elevation, shape, floating labels...) only exist on Android: they are not part of the iOS guidelines.

## Installation

### Android
The components use **Material 3**. Your Android theme must inherit from a `Theme.Material3` theme.
Inside `App_Resources/Android/src/main/res/values/styles.xml` replace `Theme.AppCompat`/`Theme.MaterialComponents` with `Theme.Material3.DayNight.NoActionBar` (see `demo-svelte`).
The Material Components version is `1.12.0` by default, set the `androidXMaterial` gradle property to change it.

### iOS
Nothing to install: the components use UIKit (Liquid Glass on iOS 26+, with fallbacks before). No CocoaPods needed.

### Production build
If you are using proguard on Android build you need ensure some resource from this plugin are not minified. You need to add ` tools:keep="@layout/ns_*"` as explained [here](https://developer.android.com/build/shrink-code#keep-resources)

## Demo
The `demo-svelte` app (with the examples in `demo-snippets/svelte`) shows every component:
```bash
yarn install
yarn build
yarn demo.svelte.android
yarn demo.svelte.ios
```
Svelte elements are registered with `<Component>Plugin.register()` from `@nativescript-community/ui-<component>/svelte`: `<uibutton>`, `<uifloatingactionbutton>`, `<uitextfield>`, `<uitextview>`, `<uiswitch>`, `<uislider>`, `<uiprogress>`, `<uiactivityindicator>`.
