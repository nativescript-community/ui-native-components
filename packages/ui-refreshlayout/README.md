# @nativescript-community/ui-refreshlayout

Pull to refresh at the top **and** the bottom of a scrollable view (CollectionView, ListView, ScrollView, WebView...), also for a chat (`reverseLayout`). `SwipeRefreshLayout` on Android, `UIRefreshControl` on iOS.

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

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
