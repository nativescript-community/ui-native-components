# @nativescript-community/ui-datetimepicker

Promise based pickers: Material 3 `MaterialDatePicker`/`MaterialTimePicker` on Android, native `UIDatePicker` in a sheet on iOS.

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

## License

Apache-2.0, part of [ui-native-components](https://github.com/nativescript-community/ui-native-components).
