# @nativescript-community/ui-surface

A floating surface for toolbars, groups of action buttons and overlays on content. Liquid Glass on iOS (a system blur before iOS 26), a Material 3 surface on Android. Built on the core `LiquidGlass` layout on iOS.

| Android | iOS |
|---|---|
| M3 surface container pill with elevation (`GridLayout` + shape) | `UIVisualEffectView` + `UIGlassEffect` (iOS 26), `UIBlurEffect` before |

## Installation

```bash
npm install @nativescript-community/ui-surface
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<Surface horizontalAlignment="center" verticalAlignment="bottom" padding="6">
    <StackLayout orientation="horizontal">
        <Button variant="plain" src="sys://house" width="52" height="52" />
        <Button variant="plain" src="sys://magnifyingglass" width="52" height="52" />
    </StackLayout>
</Surface>
```
Use `variant="plain"` buttons on iOS and `variant="text"` on Android inside the surface: the surface is then the only visible shape. For a group of buttons that each keep their own glass, use `variant="glass"` buttons (see `ui-button`) in the core `LiquidGlassContainer`, which merges the glass of its children on iOS 26.

When to use it (HIG and Material): for the **navigation and controls layer**, floating above the content, never for content itself (use `ui-card`).

## API

A layout (a `GridLayout`): the children are laid out as usual.

| Property | |
|---|---|
| `variant` | `regular` (default) or `clear` |
| `interactive` | iOS: the glass reacts to touches |
| `tint` | iOS: tint of the glass |
| `background-color`, `border-width`, `border-color`, `border-radius` | apply to the surface. The shape is a capsule by default |
| `elevation` | Android: 6dp by default (0 for `clear`) |

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
