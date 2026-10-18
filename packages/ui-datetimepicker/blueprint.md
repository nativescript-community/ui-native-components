{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-datetimepicker-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-datetimepicker-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| `MaterialDatePicker`, `MaterialTimePicker` | `UIDatePicker` in a sheet |

## Installation

```bash
npm install @nativescript-community/ui-datetimepicker
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```ts
import { pickDate, pickTime, pickDateTime, pickDateRange } from '@nativescript-community/ui-datetimepicker';

const date = await pickDate({ minDate, maxDate, title: 'Birthday' });
const time = await pickTime({ is24Hour: true });
```
Every function resolves with `undefined` when the user cancels.

## API

| Function | |
|---|---|
| `pickDate(options)` | `date`, `minDate`, `maxDate`, `firstDayOfWeek`, `inputMode` (`calendar`/`text`, Android), `style` (`inline`/`wheels`, iOS), `openAt` (Android) |
| `pickTime(options)` | `time`, `is24Hour`, `minuteInterval` (iOS), `inputMode` (`clock`/`keyboard`, Android) |
| `pickDateTime(options)` | one picker on iOS, the date then the time picker on Android |
| `pickDateRange(options)` | `start`, `end`. One picker on Android, two (start then end) on iOS |

All: `title`, `positiveButtonText`, `negativeButtonText`. iOS only: `tintColor`, `locale`.

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
