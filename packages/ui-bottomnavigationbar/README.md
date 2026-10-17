# @nativescript-community/ui-bottomnavigationbar

A bottom navigation bar without content (to drive your own views): Material 3 `NavigationBarView` on Android, native `UITabBar` on iOS.

| Android | iOS |
|---|---|
| `NavigationBarView` | `UITabBar` |

## Installation

```bash
npm install @nativescript-community/ui-bottomnavigationbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<BottomNavigationBar selectedTabIndex="0" tabSelected="{{ onSelected }}">
    <BottomNavigationTab title="Home" icon="sys://house" />
    <BottomNavigationTab title="Search" icon="sys://magnifyingglass" />
</BottomNavigationBar>
```

## API

| Property | |
|---|---|
| `selectedTabIndex`, events `tabSelected`, `tabReselected`, `tabPressed` | selection |
| `titleVisibility` | `always`, `selected`, `never` |
| `activeColor`, `inactiveColor`, `badgeColor`, `badgeTextColor` | colors |
| `showBadge(index, value)`, `removeBadge(index)` | badges |

`BottomNavigationTab`: `title`, `icon` (resource, file, `font://` or `sys://`), `isSelectable`, `activeColor`, `inactiveColor`.

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
