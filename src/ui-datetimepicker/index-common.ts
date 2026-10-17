import type { Color } from '@nativescript/core';

export interface PickerBaseOptions {
    /** title of the picker */
    title?: string;
    /** text of the confirm button. On iOS the buttons are icons (Liquid Glass) unless a text is set */
    positiveButtonText?: string;
    /** text of the cancel button */
    negativeButtonText?: string;
    /** iOS only: accent color of the picker. On Android the picker uses the colors of the app theme */
    tintColor?: Color | string;
    /** iOS only: locale identifier, like `fr_FR`. On Android the picker uses the locale of the app */
    locale?: string;
}

export interface PickDateOptions extends PickerBaseOptions {
    /** initial date, today by default */
    date?: Date;
    minDate?: Date;
    maxDate?: Date;
    /** first day of the week, from 1 (Sunday) to 7 (Saturday). By default the one of the locale */
    firstDayOfWeek?: number;
    /** Android only: the calendar (default) or a text field to type the date */
    inputMode?: 'calendar' | 'text';
    /** iOS only: the inline calendar (default) or the wheels */
    style?: 'inline' | 'wheels';
    /** Android only: the date the calendar opens at, when it is not the selected date */
    openAt?: Date;
}

export interface PickTimeOptions extends PickerBaseOptions {
    /** initial time, now by default. The returned Date uses the day of this date */
    time?: Date;
    /** 24 hour clock, else 12 hour. By default the setting of the device */
    is24Hour?: boolean;
    /** iOS only: interval of the minutes (1-30, a divisor of 60) */
    minuteInterval?: number;
    /** Android only: the clock dial (default) or the keyboard */
    inputMode?: 'clock' | 'keyboard';
}

export interface PickDateTimeOptions extends PickDateOptions, Pick<PickTimeOptions, 'is24Hour' | 'minuteInterval'> {
    /** Android only: the time picker input mode */
    timeInputMode?: 'clock' | 'keyboard';
}

export interface DateRange {
    start: Date;
    end: Date;
}

export interface PickDateRangeOptions extends Omit<PickDateOptions, 'date'> {
    /** initial range */
    start?: Date;
    end?: Date;
    /** iOS only: title of the second picker (the end date), 'End date' by default. The first one uses `title` */
    endTitle?: string;
}
