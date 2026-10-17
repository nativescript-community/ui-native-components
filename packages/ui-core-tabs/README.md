# @nativescript-community/ui-core-tabs

`TabStrip`, `TabStripItem` and `TabContentItem`, shared by `ui-tabs` and `ui-bottom-navigation`.

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

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
