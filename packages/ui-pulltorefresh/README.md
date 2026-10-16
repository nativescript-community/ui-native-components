# @nativescript-community/ui-pulltorefresh

Pull to refresh for any scrollable view (CollectionView, ListView, ScrollView, WebView...), from the **top and the bottom**.

- Android: `SwipeRefreshLayout` for the top, a nested scrolling pull for the bottom (Material 3 colors).
- iOS: `UIRefreshControl` for the start of the scrolling, a spinner pulled at the end of the scrolling for the other edge.
- The edges are **visual**: with a CollectionView `reverseLayout` (chat), `top` stays the top of the screen (older messages).

Same API as the former `@nativescript-community/ui-pulltorefresh` (`refreshing`, the `refresh` event, `indicatorColor`, `indicatorFillColor`, `refreshControl`), plus:

| | |
|---|---|
| `topEnabled` | the pull from the top triggers `refresh` (default `true`) |
| `bottomEnabled` | the pull from the bottom triggers `bottomRefresh` (default `false`) |
| `bottomRefreshing` | the bottom refresh is running, set it to `false` when the work is done |

```svelte
<uipulltorefresh bottomEnabled="true" refreshing={top} bottomRefreshing={bottom}
    on:refresh={() => { top = true; loadOlder().then(() => (top = false)); }}
    on:bottomRefresh={() => { bottom = true; loadNewer().then(() => (bottom = false)); }}>
    <collectionview items={items} reverseLayout="true" />
</uipulltorefresh>
```
