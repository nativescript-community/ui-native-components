export interface PickDateOptions {
    /** initial date, today by default */
    date?: Date;
    minDate?: Date;
    maxDate?: Date;
    /** title of the picker */
    title?: string;
}

export interface PickTimeOptions {
    /** initial time, now by default. The returned Date uses the day of this date */
    time?: Date;
    /** 24 hour clock, else 12 hour. By default the setting of the device */
    is24Hour?: boolean;
    title?: string;
    /** iOS only: interval of the minutes (1-30, a divisor of 60) */
    minuteInterval?: number;
    /** Android only: the clock dial (default) or the keyboard */
    inputMode?: 'clock' | 'keyboard';
}

export interface PickDateTimeOptions extends PickDateOptions, Pick<PickTimeOptions, 'is24Hour' | 'minuteInterval' | 'inputMode'> {}
