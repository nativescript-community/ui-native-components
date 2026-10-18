{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-refreshlayout-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-refreshlayout-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| `SwipeRefreshLayout` + a nested scrolling pull for the bottom | `UIRefreshControl` + a spinner pulled at the end |

## Installation

```bash
npm install @nativescript-community/ui-refreshlayout
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<RefreshLayout bottomEnabled="true" refreshing="{{ top }}" bottomRefreshing="{{ bottom }}" refresh="{{ onTop }}" bottomRefresh="{{ onBottom }}">
    <CollectionView items="{{ items }}" reverseLayout="true" />
</RefreshLayout>
```
The edges are **visual**: with `reverseLayout` the top of the screen shows the oldest messages. Set `refreshing`/`bottomRefreshing` back to `false` when the work is done.

## API

| Property | |
|---|---|
| `refreshing`, `bottomRefreshing` | state of the two refreshes |
| `topEnabled` (default `true`), `bottomEnabled` (default `false`) | which pulls are active |
| events `refresh`, `bottomRefresh` | |
| `indicatorColor`, `indicatorFillColor` | CSS `indicator-color`, `indicator-fill-color` |
| `refreshControl` | the `UIRefreshControl` (iOS) |

Same API as the former `@nativescript-community/ui-pulltorefresh`.

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
