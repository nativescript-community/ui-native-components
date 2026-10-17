/**
 * Date and time pickers.
 * Android uses the Material 3 MaterialDatePicker/MaterialTimePicker. iOS uses the native UIDatePicker, in a sheet.
 * @module @nativescript-community/ui-datetimepicker
 */

import { DateRange, PickDateOptions, PickDateRangeOptions, PickDateTimeOptions, PickTimeOptions } from './index-common';
export * from './index-common';

/**
 * Shows a date picker.
 * @returns the picked date, or undefined when cancelled
 */
export function pickDate(options?: PickDateOptions): Promise<Date | undefined>;

/**
 * Shows a time picker.
 * @returns the picked time (on the day of `options.time`), or undefined when cancelled
 */
export function pickTime(options?: PickTimeOptions): Promise<Date | undefined>;

/**
 * Shows a date and time picker: one native picker on iOS, the date picker then the time picker on Android.
 * @returns the picked date and time, or undefined when cancelled
 */
export function pickDateTime(options?: PickDateTimeOptions): Promise<Date | undefined>;

/**
 * Shows a date range picker: one picker on Android, two (start then end) on iOS.
 * @returns the picked range, or undefined when cancelled
 */
export function pickDateRange(options?: PickDateRangeOptions): Promise<DateRange | undefined>;
