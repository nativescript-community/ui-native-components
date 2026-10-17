# @nativescript-community/ui-searchbar

SearchBar with `variant` and spans. A Material 3 search bar look on Android, native `UISearchBar` (Liquid Glass on iOS 26) on iOS.

| Android | iOS |
|---|---|
| `SearchView` styled as a M3 search bar | `UISearchBar` |

## Installation

```bash
npm install @nativescript-community/ui-searchbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<SearchBar hint="Search" variant="filled" textChange="{{ onText }}" submit="{{ onSubmit }}" />
```

## API

Same API as the core `SearchBar` (`text`, `hint`, `submit`, `clear`...), plus:

| Property | |
|---|---|
| `variant` | `filled`, `outline` (Material) or `prominent`, `minimal` (iOS) |
| `formattedHint`, `formattedText` | spans. Uses `@nativescript-community/text` when installed (optional) |

`background-color`, `border` and `border-radius` apply to the bar.

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
