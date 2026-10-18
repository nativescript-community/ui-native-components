{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-toolbar-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-toolbar-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| Material 3 `MaterialToolbar` | `UINavigationBar` used as a view: its bar buttons are in Liquid Glass capsules on iOS 26 |

## Installation

```bash
npm install @nativescript-community/ui-toolbar
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<GridLayout rows="auto,*">
    <Toolbar title="Inbox" subtitle="3 unread" navigationIcon="sys://chevron.left" items="{{ items }}" navigationTap="{{ onBack }}" itemTap="{{ onItem }}" />
    <!-- the content -->
</GridLayout>
```
```ts
const items = [
    { id: 'search', title: 'Search', icon: 'sys://magnifyingglass', androidIcon: 'res://ic_search' },
    { id: 'font', title: 'Font icon', icon: 'font://' },
    { id: 'settings', title: 'Settings', showAsAction: 'never' }
];
```

## API

| Property | |
|---|---|
| `title`, `subtitle` | the title (centered on iOS, `centerTitle` on Android) |
| `navigationIcon` | icon at the start: back, menu, close... |
| `items` | the actions (below) |
| `color` | color of the title and of the icons |
| `background-color` | background of the bar. Android: `colorSurface` by default |
| events `navigationTap`, `itemTap` (`event.item`) | |

An item: `id`, `title`, `icon`, `androidIcon`, `iosIcon`, `showAsAction` (`always`, `ifRoom`, `never`), `disabled`, `onTap`.
`showAsAction: 'never'` puts the item in the overflow menu (the `ellipsis` button on iOS).

An icon can be:
* `res://name` or a file path
* `sys://name`: an SF Symbol (iOS)
* `font://code`: a glyph of the `font-family` of the toolbar (a template image on iOS, tinted by the bar)
* an `ImageSource`
* a `FormattedString` (spans, with `@nativescript-community/text` when it is installed): drawn into an icon that keeps the colors of its spans

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
