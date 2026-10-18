{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-slider-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-slider-android.png" height="500" /> |

{{ template:toc }}

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

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
