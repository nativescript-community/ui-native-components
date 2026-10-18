{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-searchbar-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-searchbar-android.png" height="500" /> |

{{ template:toc }}

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

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
