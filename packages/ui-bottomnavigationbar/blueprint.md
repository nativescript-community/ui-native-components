{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-bottomnavigationbar-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-bottomnavigationbar-android.png" height="500" /> |

{{ template:toc }}

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

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
