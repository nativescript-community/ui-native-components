{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

Shared base of `ui-tabs` and `ui-bottom-navigation`: it draws nothing itself, see their screenshots.

{{ template:toc }}

| Android | iOS |
|---|---|
| `TabLayout` / `NavigationBarView` | `UISegmentedControl` / `UITabBar` |

## Installation

```bash
npm install @nativescript-community/ui-core-tabs
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```ts
import { TabContentItem, TabStrip, TabStripItem } from '@nativescript-community/ui-core-tabs';
```

## API

Same API as the NativeScript tab elements. Labels support spans (`formattedText`). In svelte-native register `uitabstrip`, `uitabstripitem` and `uitabcontentitem`.

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
