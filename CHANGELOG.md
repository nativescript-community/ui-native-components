# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.2](https://github.com/nativescript-community/ui-native-components/compare/v1.0.1...v1.0.2) (2026-10-20)

### Bug Fixes

* **android:** look up material attr and id ints by name instead of R reflection ([59ca829](https://github.com/nativescript-community/ui-native-components/commit/59ca8292ed801864802cff3b31b6fee05f9bcbfd))

## [1.0.1](https://github.com/nativescript-community/ui-native-components/compare/v1.0.0...v1.0.1) (2026-10-19)

### Features

* **ui-bottomsheet:** bottom card with detents on Mac Catalyst ([1a1830c](https://github.com/nativescript-community/ui-native-components/commit/1a1830c51e34d513bb48bd6225e0e95d728dd61b))

### Bug Fixes

* **android:** complete native-api-usage.json and read R attrs without R ([1a5c054](https://github.com/nativescript-community/ui-native-components/commit/1a5c05442dac31e3bc0277ffc49fb5672bf01705))
* **dialogs:** stop showUIAlertController reading isAlertController of a null controller ([922840c](https://github.com/nativescript-community/ui-native-components/commit/922840c2078008bbc1e94dbb8b961339f8226888))

## 1.0.0 (2026-10-18)

### Features

* **bottom-navigation:** iOS 26 minimizeBehavior and accessory (custom view) for the tab bar ([859900a](https://github.com/nativescript-community/ui-native-components/commit/859900a298a6674edd64a8f42eff170d1e7857a0))
* **bottom-navigation:** iOS search tab (UISearchTab) with integrated search field, results view and events ([bd80526](https://github.com/nativescript-community/ui-native-components/commit/bd805264ad3475c4c7efa4893adcd1a4a003810a))
* **bottomsheet:** detents, initial/programmatic detent, grabber, corner radius, iOS sheet options ([a28d0b1](https://github.com/nativescript-community/ui-native-components/commit/a28d0b1cc9eb6562f6a8332ef8ad1bf0b9b14bf8))
* **bottomsheet:** largestUndimmedDetentIndex, onWillDismiss/onDismissAttempt, nested scrolling for lists (ui-collectionview demo) ([f125e22](https://github.com/nativescript-community/ui-native-components/commit/f125e22f12bf1d8a8d6d3231a1a3750b990f267d))
* **card,surface:** add ui-card (MaterialCardView / grouped surface) and ui-surface (M3 surface / Liquid Glass) ([d98b34f](https://github.com/nativescript-community/ui-native-components/commit/d98b34f593687235582609c40313c7f338ee1e80))
* **core,menu,segmentedbar:** custom icons from spans (renderFormattedTextToImageSource) ([c51223c](https://github.com/nativescript-community/ui-native-components/commit/c51223cd0c0fcef9375cc236f78706f8094f0e44))
* **datetimepicker:** add ui-datetimepicker (Material 3 pickers on Android, UIDatePicker in a sheet on iOS) ([b026846](https://github.com/nativescript-community/ui-native-components/commit/b0268469cf4559ff64b1a7d39d11c4e0b71c8d57))
* hideOnScroll for the floating action button and bottom navigation bar, app bar docs ([db77d43](https://github.com/nativescript-community/ui-native-components/commit/db77d43097eb1188a053420d955264ad842059d5))
* Material 1.14 / Material 3 Expressive (wavy indicators) and edge-to-edge demo ([9fb8637](https://github.com/nativescript-community/ui-native-components/commit/9fb8637820b0c021677342a9bd95da33d3f2847c))
* **menu:** add ui-menu (Material PopupMenu on Android, native UIMenu on iOS) ([d9ecf90](https://github.com/nativescript-community/ui-native-components/commit/d9ecf9052e8c8869b780e27fb1d44e1f4ef813e9))
* **menu:** placement option (above/below, start/end), subtitle on Android ([39bebbd](https://github.com/nativescript-community/ui-native-components/commit/39bebbdbba1e942e7d701a0e48fbcf035ebf3810))
* native-api-usage.json for every package on Android and iOS ([cfd7dcc](https://github.com/nativescript-community/ui-native-components/commit/cfd7dcc4b996b02319cfacee233bc56c29df70e4))
* **pulltorefresh:** add ui-pulltorefresh (top and bottom, reverseLayout aware) and more date/time picker options ([c2b64ea](https://github.com/nativescript-community/ui-native-components/commit/c2b64eadd02015337c7e3729a48242c0e946d712))
* **searchbar,checkbox:** add ui-searchbar (M3 pill / UISearchBar) and ui-checkbox (MaterialCheckBox / SF Symbols, indeterminate) ([f2f56e7](https://github.com/nativescript-community/ui-native-components/commit/f2f56e7ebe38bb57fab7f142f9b0151fa680d6ec))
* **searchbar,textfield:** formattedHint/formattedText spans; fix borders/radius on switch, slider, progress, search bar; checkbox padding; styling audit demo ([a1de1aa](https://github.com/nativescript-community/ui-native-components/commit/a1de1aaf6d1b6659719779ff5a09777e546f751c))
* **segmentedbar,tabs:** rich text (formattedText/spans) with optional @nativescript-community/text ([a7cfb7d](https://github.com/nativescript-community/ui-native-components/commit/a7cfb7ddc7708f1835f29e0f0671d2b260b2d1e6))
* **segmentedbar:** add ui-segmentedbar with icon items (MaterialButtonToggleGroup / UISegmentedControl) ([df8b6fb](https://github.com/nativescript-community/ui-native-components/commit/df8b6fb0e5d966f9113b4207af3dd0c5548fc728))
* svelte demo app ([741b406](https://github.com/nativescript-community/ui-native-components/commit/741b406c639270e93c0fb68ec5974bc354404bf9))
* **tabs:** add ui-tabs with UISegmentedControl on iOS and MaterialTabs on Android ([ff34742](https://github.com/nativescript-community/ui-native-components/commit/ff34742abb9225b61daa4967cfe7b3a7aaecfc53))
* **toolbar:** add ui-toolbar (MaterialToolbar / UINavigationBar) with sys, font and spans icons ([43116c6](https://github.com/nativescript-community/ui-native-components/commit/43116c6194b5e80f32a853ef8e68be84bf93a101))
* ui-* components, Material 3 on Android and native UIKit on iOS ([42e3ddd](https://github.com/nativescript-community/ui-native-components/commit/42e3dddb222da766c2eca35ee248dfda2e63172c))
* **ui-appbar:** a view inside an appBarItem is its actionView (uibutton in the bar) ([dcb9a7f](https://github.com/nativescript-community/ui-native-components/commit/dcb9a7f4fbeb04955558ce42408fca079a78467c))
* **ui-appbar:** action items with menu / prominent, search (UISearchController / SearchView) ([5b59641](https://github.com/nativescript-community/ui-native-components/commit/5b596415b3891ed375a6969f57f1e006f750c200))
* **ui-appbar:** Android searchMode=bar (Material 3 SearchBar + SearchView, searchContent) ([5bae2cb](https://github.com/nativescript-community/ui-native-components/commit/5bae2cbfffa68586779e4c569bb4152c43d5f54b))
* **ui-appbar:** AppBar (size, scroll behavior, subtitle, spans, translucent, scrollTarget) for Android and iOS ([75f8aee](https://github.com/nativescript-community/ui-native-components/commit/75f8aee2a5c513de549345083051499566016287))
* **ui-appbar:** AppPage spike (Coordinator nested in the Page root, gesturehandler compatible) ([0c063c3](https://github.com/nativescript-community/ui-native-components/commit/0c063c33b1c5c875605642ac81406d4778c9dbe4))
* **ui-appbar:** badges on items and bottom items, iOS 26 searchPlacement ([d262fb5](https://github.com/nativescript-community/ui-native-components/commit/d262fb588cb30842eeb237fe00184d06a945eea1))
* **ui-appbar:** bottomItems (UIToolbar / BottomAppBar), inline title of collapsed pushed large titles on iOS ([baab2b7](https://github.com/nativescript-community/ui-native-components/commit/baab2b79a134c7f717cd31179d4fd0d0ad0069c3))
* **ui-appbar:** page overlay, hide for large bars, translucent bar with content under it (iOS blur, Android tint) ([05e7a88](https://github.com/nativescript-community/ui-native-components/commit/05e7a88372a2b78404f3069acc01678596ef74e7))
* ui-bottomnavigationbar, Material 3 NavigationBar on Android and native UITabBar on iOS ([e103554](https://github.com/nativescript-community/ui-native-components/commit/e103554a934686b49273a45c7e6ae6420988aa40))
* ui-core-tabs and ui-bottom-navigation ([cd08d7a](https://github.com/nativescript-community/ui-native-components/commit/cd08d7ac8507241ddafa2bb3bda6afa47627a62c))
* **ui-snackbar:** iOS snackbar with liquid-toasts (SwiftUI Liquid Glass) ([ec93fd7](https://github.com/nativescript-community/ui-native-components/commit/ec93fd7067b2a7b779bdf9a094c25a7ac8b22693))
* **ui-snackbar:** position option (top|bottom) on iOS ([a19bc8f](https://github.com/nativescript-community/ui-native-components/commit/a19bc8f5e4bf23ffc79de4022243f3b18f74c770))

### Bug Fixes

* **android:** rename native package, layouts and styles so they coexist with ui-material-* ([ff8c61e](https://github.com/nativescript-community/ui-native-components/commit/ff8c61e8c26ca2f7a85e4f7fefdd8d860c98bcc1))
* **bottom-navigation:** build the search tab when the strip items are loaded instead of a timer ([9c390eb](https://github.com/nativescript-community/ui-native-components/commit/9c390ebbc5ceabd7ffcd058a761e4e3769d35e15))
* **bottomnavigationbar:** iOS labels laid out for the real size when the bar gets its width ([7dfe7fa](https://github.com/nativescript-community/ui-native-components/commit/7dfe7fa6606299b329c151ecee579b98d9b6fe28))
* **bottomnavigationbar:** restore the selection on the main queue instead of a JS timer ([d1d55a8](https://github.com/nativescript-community/ui-native-components/commit/d1d55a86eeb91216116840e99d0d959b8b7f048f))
* **bottomsheet:** tap outside dismisses with an undimmed detent on iOS; demo content uses the sheet background ([732d944](https://github.com/nativescript-community/ui-native-components/commit/732d9441aa51a6f37c13d2ecec07a5881c53258c))
* **surface:** iOS measure includes the padding (icons were shifted down) ([0fe73df](https://github.com/nativescript-community/ui-native-components/commit/0fe73df194fe09d2d7666c32f6efd990af0d3376))
* **tabs:** keep Material 3 theme colors on Android tabs ([ea26382](https://github.com/nativescript-community/ui-native-components/commit/ea26382ce9515b9c396c9790d28fedc21334071b))
* **ui-appbar:** Android bar surface, modern tinted icons, lift, translucent small/large, keyboard and search layout ([c08c549](https://github.com/nativescript-community/ui-native-components/commit/c08c54918c0cc3f61f4a3dc08c30705bd4ab650c))
* **ui-appbar:** Android hide follows list scroll immediately, more see-through translucent bar ([0d7b859](https://github.com/nativescript-community/ui-native-components/commit/0d7b859200aec1876ced6da31ecfaccc1a290aec))
* **ui-appbar:** cover the status bar area of a hidden Android bar ([09b8e18](https://github.com/nativescript-community/ui-native-components/commit/09b8e18aaa0642b86c0149408f26d81094b1ac3e))
