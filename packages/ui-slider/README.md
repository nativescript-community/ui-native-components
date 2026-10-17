# @nativescript-community/ui-slider

Slider with `stepSize` and colors. Material 3 `Slider` on Android, native `UISlider` on iOS.

| Android | iOS |
|---|---|
| `Slider` | `UISlider` |

## Installation

```bash
npm install @nativescript-community/ui-slider
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```xml
<Slider value="40" minValue="0" maxValue="100" stepSize="10" trackFillColor="#6750a4" />
```

## API

| Property | |
|---|---|
| `value`, `minValue`, `maxValue` | core properties |
| `stepSize` | snaps the value |
| `trackFillColor`, `trackBackgroundColor`, `thumbColor` | colors |

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
