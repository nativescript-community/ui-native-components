# @nativescript-community/ui-card

A card groups related content. Material 3 `MaterialCardView` on Android, a grouped rounded surface on iOS. **No Liquid Glass for content**: the Apple HIG keeps glass for the controls layer (toolbars, tab bars, floating controls), see `ui-surface` for those.

| Android | iOS |
|---|---|
| `MaterialCardView` (elevated, filled, outlined) | a grouped rounded surface (`secondarySystemBackground`), no elevation, no glass |

## Installation

```bash
npm install @nativescript-community/ui-card
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<Card variant="outlined">
    <StackLayout padding="16">
        <Label text="Title" fontWeight="bold" />
        <Label text="Content" />
    </StackLayout>
</Card>
```
A card has one child: put a layout in it.

## API

| Property | |
|---|---|
| `variant` | `elevated` (default), `filled`, `outlined` |
| `background-color`, `border-width`, `border-color`, `border-radius` | apply to the card. Defaults: 12 radius (Android), 16 (iOS) |
| `elevation`, `rippleColor` | Android only (see `installMixins` of `ui-core`) |

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
