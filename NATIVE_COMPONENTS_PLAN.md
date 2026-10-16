# Native augmented components — plan

Status: phase 1 done on branch `feat/native-components` (uncommitted), 2026-10-12. Working doc, not published.

## Phase 1 status

New packages `@nativescript-community/ui-*` (same version as the repo, sources in `src/ui-*`, built to `packages/ui-*`):
`ui-core`, `ui-switch`, `ui-progress`, `ui-activityindicator`, `ui-slider`, `ui-ripple`, `ui-cardview`, `ui-button`, `ui-floatingactionbutton`,
`ui-textfield`, `ui-textview`, `ui-bottomsheet`, `ui-snackbar`, `ui-dialogs`.
Each `ui-material-*` package now depends on its `ui-*` package: Android re-exports it with the `MD*` CSS type, iOS keeps the MDC code
extending the shared `*Base` class. `ui-material-core` re-exports `ui-core` and adds the MDC themer / ripple / elevation on iOS.
All packages compile (`npm run tsc` in each package). Nothing was run on a device or simulator.

Not done yet (still in `ui-material-*` only):
- Navigation: `core-tabs`, `tabs`, `bottom-navigation`, `bottomnavigationbar` (phase 5, iOS rewrite).
- `speeddial` (depends on the material Button and its `MD*` CSS types; decide neutral names).
- Framework bindings (vue/angular/svelte/react) of the new packages.
- `yarn install` is needed to register the new workspaces in `yarn.lock` (`lerna run` fails until then, `npm run tsc` per package works).
- `@nativescript/types-ios` 8.9.1 has no iOS 26 typings (UITab exists, glass APIs do not): use `as any` casts or upgrade the types.
- iOS code paths are written but untested: bottomsheet detents, dialogs custom view (`contentViewController` key), slider stepSize handler, textfield digits.

## Goal

A component library that carries every augmentation `ui-material-components` adds on top of NativeScript core, implemented with each platform's own native design system:

- **Android**: Material Components (unchanged from today).
- **iOS**: plain UIKit following the Apple HIG, using the latest APIs (Liquid Glass on iOS 26+) with availability fallbacks. Deployment target iOS 16.
- **Future platforms** (visionOS, tvOS, macOS…): new platform files against the same shared contract.

`ui-material-components` then becomes a thin layer on top of it (shared contract + Android re-use, MDC kept only on iOS) until MDC-iOS is dropped.

## Why

- material-components-ios: maintenance mode since 2021-07, last tag v124.2.0 (2021), GitHub repo archived 2025-12.
- CocoaPods trunk read-only from 2026-12-02. A pure-UIKit iOS side needs no pods (SPM available for plugins since NS CLI 8.9 if ever needed).
- MDC views never get Liquid Glass; `UIDesignRequiresCompatibility` is reported to be ignored with the iOS 27 SDK.

## Feature classification rule

Every property / option / method falls in one bucket:

1. **Functional** (does something, not just styling): implemented natively on every platform.
2. **Material visual** (ripple, elevation, shape, floating label, helper/error/counter, strokes, halo…): Android only, no-op elsewhere.
3. **MDC-iOS visual**: lives only in the `ui-material` iOS layer.

If no HIG concept exists for a functional feature, it is Android-only and resolves / no-ops on iOS with a dev warning.

## Per-component decisions (iOS side of the new lib)

| Component | iOS |
|---|---|
| core | CSS props (`elevation`, `dynamic-elevation-offset`, `ripple-color`, `ripple-color-alpha`, `shape`, `variant`) registered once here; no-op on iOS. Themer = plain colors (primary may map to window `tintColor`). `installMixins`: Android ripple/elevation, iOS focus helpers only. |
| ripple | plain StackLayout, no-op. |
| cardview | **Android-only component.** iOS = plain ContentView, all extra props no-op. |
| button | `UIButton.Configuration`. `variant` accepts Material names (mapped by emphasis) **and** iOS-native names. `isLoading` → `showsActivityIndicator`. `src` icon. New `role`. |
| floatingactionbutton | capsule `UIButton` (prominentGlass on 26+, filled before), `expanded` shows title, `show()/hide()` animated. Elevation no-op. |
| speeddial | pure JS, unchanged (depends on button). |
| textfield / textview | core `UITextField` / `UITextView`. Keep functional: `digits`, `closeOnReturn`, `secureWithoutAutofill`, `requestFocus/clearFocus`. No-op: `variant`, floating*, helper*, error*, counter, stroke*. `setSelection` already in core → drop. |
| slider | `UISlider` tints (`trackFillColor`, `trackBackgroundColor`, `thumbColor`). `stepSize` → iOS 26 track configuration ticks (verify API in typings), snapping fallback. Elevation/ripple/hollow thumb no-op. |
| progress | `progressColor`/`progressBackgroundColor` = core `color`/`backgroundColor`. `indeterminate` swaps to a `UIActivityIndicatorView` (container holding both). |
| activityindicator | `UIActivityIndicatorView`; determinate `value`/`maxValue` no-op. |
| switch, segmentedbar | already native. Remove wrong pod from switch. |
| bottom-navigation | `UITabBarController`, `UITab` API (18+), iPad sidebar-adaptable, iOS 26 minimize behavior / bottom accessory / search tab, `UITabBarAppearance`. Remove forced compact size class on iPad. Keep icon pre-tint as opt-in. |
| bottomnavigationbar | standalone `UITabBar`; badges native; `titleVisibility` no-op; `isSelectable` kept. |
| tabs | `tabsPosition=bottom` → same as bottom-navigation. `tabsPosition=top` → `UISegmentedControl` + paging controller (HIG: tab views unsupported on iOS, use segmented control). Keep `swipeEnabled`, `offscreenTabLimit`, `unloadOnTabChange`. Indicator color / ripple / icon+title no-op. |
| bottomsheet | `UISheetPresentationController`: custom content-fit detent, `skipCollapsedState`, grabber, `largestUndimmedDetentIdentifier` for touch-behind, zoom transition (18+). No-op: continuous drag offset, `ignoreKeyboardHeight`. `dismissOnBackgroundTap` / `dismissOnDraggingDownSheet` coupled. |
| dialogs | `UIAlertController` (glass automatic). Custom `view`: either in the alert via hidden `contentViewController` key (guarded, falls back to sheet) or as a content-fit sheet — selected by an option. Prompt/login via `addTextField`. Styling options no-op. Keep `AlertDialog.hide()`, `shouldResolveOnAction`, `closeCallback`. |
| snackbar | **Android-only.** iOS resolves immediately (no UI) with dev warning. |
| appbar, page | dropped. |

### Button `variant`

| Material (cross-platform) | iOS 26+ | iOS < 26 |
|---|---|---|
| `contained`, `flat` | `prominentGlass` | `filled` |
| `outline` | `glass` | `tinted` |
| `text` | `plain` | `plain` |

iOS-native names accepted directly: `plain`, `gray`, `tinted`, `filled`, `borderless`, `bordered`, `borderedTinted`, `borderedProminent`, `glass`, `prominentGlass`, `clearGlass`, `prominentClearGlass` (glass names fall back to the closest pre-26 style).

On Android, iOS names map back by emphasis: prominent/filled → `contained`; `tinted`/`gray`/`glass`/`clearGlass` → `flat`; `bordered*` → `outline`; `plain`/`borderless` → `text`.

### Button `role`

`normal | primary | cancel | destructive`. iOS → `UIButton.role` (+ red tint for destructive). Android → destructive uses theme error color; others no visual change.

## Layering: ui-material on top of the new lib

- New lib owns: common files (properties, CSS props, events, base classes), themer, Android Material code (moved verbatim).
- `ui-material-*` Android: thin subclass re-applying the old `@CSSType('MD…')`.
- `ui-material-*` iOS: existing MDC code, now extending the new lib's **Base** class (not its iOS class).
- CSS properties registered once (new lib core); ui-material declares the new lib as peer dependency.
- One themer: ui-material iOS themer extends the base one and additionally builds MDC schemes.
- Element names: new lib neutral names, ui-material keeps `MD*`.

## Repo

One monorepo for now: new package family next to the existing one, workspace-linked. Lerna independent versioning recommended.

## Upstream candidates (@nativescript/core 9.1.2 checked)

- `showModal` sheet options (detents, grabber, undimmed, peek) — core only has `ios.presentationStyle`.
- Button icon (`src`) — none in core.
- TabView item badges — none in core.
- Slider `stepSize`, track background color.

## Phases

1. Scaffold new package family; move core + all common/Android files.
2. Trivial iOS: switch, segmentedbar, ripple, cardview, activityindicator, progress, slider, textfield/textview, speeddial, snackbar (no-op).
3. Button + FAB (variants, role, loading).
4. Bottomsheet, dialogs.
5. bottom-navigation, bottomnavigationbar, tabs.
6. Rewire ui-material as thin layer, new major. Upstream PRs. Migration doc.

## Open

- Package scope / names for the new lib.
- Confirm iOS 26 typings in `@nativescript/types-ios`.

## Bugs spotted in current repo

- `src/bottomsheet/vue3/index.ts:27` `resolved` const never set.
- `src/tabs/index.ios.ts:180` assigns `_dataSource` instead of `mDataSource`.
- `src/cardview/cardview.ios.ts:109` cut-corner check reads `smallComponentShape`.
- Android textfield `underline` variant draws no underline.
- switch iOS Podfile pulls `ProgressView+Theming`.

## UIButton.Configuration / Liquid Glass (button + FAB iOS) — done, verified on the iOS 26.5 simulator

- `variant` is mapped with `toIOSVariant` (Material names) or used as is (`plain`, `gray`, `tinted`, `filled`, `borderless`, `bordered`, `borderedTinted`,
  `borderedProminent`, `glass`, `prominentGlass`, `clearGlass`, `prominentClearGlass`). Glass variants use the iOS 26 factories and fall back to tinted/filled/plain before iOS 26.
- Implementation: `src/ui-core/ios-button-configuration.ts` (shared by `ui-button` and `ui-floatingactionbutton`). The core Button still drives the UIButton
  through the legacy APIs. What works on a configuration button: attributed title, image, title color. What is ignored and was re-routed to the configuration:
  font (`titleTextAttributesTransformer`), padding/border widths (`contentInsets`), background color/border/radius (`UIBackgroundConfiguration`).
  The core forces `UIColor.labelColor` as text color: `_setColor` is overridden to keep the adaptive foreground color of the configuration.
- New API: `role` (`normal|primary|cancel|destructive`, `UIButton.role`, destructive = red tint), `busy` (`showsActivityIndicator`, iOS only),
  `sys://` icons in `src`. FAB: capsule, round icon-only, extended with `expanded`, `show()/hide()`, `variant` defaults to `prominentGlass`.
- Known limits: `padding: 0` only applies when the padding value changes (default insets are kept otherwise); `busy` is a no-op on Android;
  nothing tested on iOS < 26 (fallback styles), iPad or dark mode.
- Test setup used: a throwaway `ns create` app with the built packages copied into `node_modules`; its `webpack.config.js` needs
  `config.set('snapshot', { managedPaths: [] })` (chainWebpack) or webpack keeps serving the old copy of the packages.

## Demo app (svelte) and Material 3 — done

- `demo-svelte` (plugin seed submodule) + `demo-snippets/svelte` (one demo page per component: Buttons, FloatingActionButtons, TextFields, Controls, Cards, Dialogs, BottomSheet, Snackbar).
  Svelte elements: `src/ui-*/svelte/index.ts` registers `<uibutton>`, `<uitextfield>`... ; `ui-bottomsheet/svelte` has `showBottomSheet`/`closeBottomSheet`.
  Run with `yarn demo.svelte.android` / `yarn demo.svelte.ios` (use your own `ns`). Verified on the Android emulator (Material 3) and the iOS 26.5 simulator.
- Android moved to Material 3: all `Widget.MaterialComponents.*` styles replaced by `Widget.Material3.*` (button, textfield, textview, progress, dialogs),
  material dependency `1.12.0` everywhere (viewpager2 dropped from `ui-core`), the Android themer reads `colorSecondary` / `colorPrimaryContainer` / `colorSurface`
  (Material 3 attributes) and the demo theme is `Theme.Material3.DayNight.NoActionBar`.
- Findings while testing:
  - the NativeScript theme (`@nativescript/theme` core.css) sets an inherited `color` that overrides the text color of the buttons on both platforms: the demo does not import it.
  - `ImageSource` cannot decode vector drawables: `src="res://..."` needs PNGs on Android (`sys://` works on iOS).
  - the core `Switch` is drawn off screen on iOS 26 when stretched (default alignment): the demo uses `horizontalAlignment="left"`.
  - `UIAlertController` custom view (`contentViewController` key) works on iOS 26.5 (Liquid Glass alert), the view must be loaded explicitly (`viewDidLoad` is not called when `view` is set manually).
  - the iOS bottom sheet (`UISheetPresentationController`) works: grabber, content-fit detent, close with result.
- Not done: Material 3 circular progress for `ui-activityindicator` (still a plain `ProgressBar`), FAB `size` on Android (only padding), Material 3 Expressive (material 1.14 alphas).
