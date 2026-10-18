{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-card-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-card-android.png" height="500" /> |

{{ template:toc }}

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

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
