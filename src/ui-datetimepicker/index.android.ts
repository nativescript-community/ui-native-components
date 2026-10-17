import { Application } from '@nativescript/core';
import { DateRange, PickDateOptions, PickDateRangeOptions, PickDateTimeOptions, PickTimeOptions } from './index-common';
export * from './index-common';

function getFragmentManager(): androidx.fragment.app.FragmentManager {
    const activity = (Application.android.foregroundActivity || Application.android.startActivity) as androidx.appcompat.app.AppCompatActivity;
    return activity.getSupportFragmentManager();
}

/**
 * MaterialDatePicker works with the UTC midnight of the days
 */
const toUTC = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Settings shared by the date and the date range pickers
 */
function configureDateBuilder(builder: com.google.android.material.datepicker.MaterialDatePicker.Builder<any>, options: PickDateOptions) {
    const datepicker = com.google.android.material.datepicker;
    if (options.title) {
        builder.setTitleText(options.title);
    }
    if (options.positiveButtonText) {
        (builder as any).setPositiveButtonText(options.positiveButtonText);
    }
    if (options.negativeButtonText) {
        (builder as any).setNegativeButtonText(options.negativeButtonText);
    }
    if (options.inputMode) {
        builder.setInputMode(options.inputMode === 'text' ? datepicker.MaterialDatePicker.INPUT_MODE_TEXT : datepicker.MaterialDatePicker.INPUT_MODE_CALENDAR);
    }
    if (options.minDate || options.maxDate || options.firstDayOfWeek || options.openAt) {
        const constraints = new datepicker.CalendarConstraints.Builder();
        const validators = new java.util.ArrayList<any>();
        if (options.minDate) {
            constraints.setStart(toUTC(options.minDate));
            validators.add(datepicker.DateValidatorPointForward.from(toUTC(options.minDate)));
        }
        if (options.maxDate) {
            constraints.setEnd(toUTC(options.maxDate));
            validators.add(datepicker.DateValidatorPointBackward.before(toUTC(options.maxDate)));
        }
        if (options.firstDayOfWeek) {
            (constraints as any).setFirstDayOfWeek(options.firstDayOfWeek);
        }
        if (options.openAt) {
            constraints.setOpenAt(toUTC(options.openAt));
        }
        if (validators.size() > 0) {
            constraints.setValidator(datepicker.CompositeDateValidator.allOf(validators));
        }
        builder.setCalendarConstraints(constraints.build());
    }
}

/**
 * The runtime gives the java.lang.Long as a number
 */
const toNumber = (value: any): number => (typeof value === 'number' ? value : (value as java.lang.Long).longValue());
const fromUTC = (value: any, time?: Date) => {
    const utc = new Date(toNumber(value));
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), time?.getHours() ?? 0, time?.getMinutes() ?? 0, time?.getSeconds() ?? 0);
};

export function pickDate(options: PickDateOptions = {}): Promise<Date | undefined> {
    return new Promise((resolve) => {
        const datepicker = com.google.android.material.datepicker;
        const initial = options.date || new Date();
        const builder = datepicker.MaterialDatePicker.Builder.datePicker();
        builder.setSelection(java.lang.Long.valueOf(toUTC(initial)));
        configureDateBuilder(builder, options);
        const picker = builder.build();
        let done = false;
        const finish = (value: Date | undefined) => {
            if (!done) {
                done = true;
                resolve(value);
            }
        };
        picker.addOnPositiveButtonClickListener(
            new datepicker.MaterialPickerOnPositiveButtonClickListener({
                onPositiveButtonClick(selection: any) {
                    // the day picked, with the time of the initial date
                    finish(fromUTC(selection, initial));
                }
            })
        );
        // the positive button is handled before the dismissal
        picker.addOnDismissListener(new android.content.DialogInterface.OnDismissListener({ onDismiss: () => finish(undefined) }));
        picker.show(getFragmentManager(), 'ns-date-picker');
    });
}

export function pickDateRange(options: PickDateRangeOptions = {}): Promise<DateRange | undefined> {
    return new Promise((resolve) => {
        const datepicker = com.google.android.material.datepicker;
        const builder = datepicker.MaterialDatePicker.Builder.dateRangePicker();
        if (options.start && options.end) {
            builder.setSelection(new androidx.core.util.Pair<java.lang.Long, java.lang.Long>(java.lang.Long.valueOf(toUTC(options.start)), java.lang.Long.valueOf(toUTC(options.end))));
        }
        configureDateBuilder(builder, options);
        const picker = builder.build();
        let done = false;
        const finish = (value: DateRange | undefined) => {
            if (!done) {
                done = true;
                resolve(value);
            }
        };
        picker.addOnPositiveButtonClickListener(
            new datepicker.MaterialPickerOnPositiveButtonClickListener({
                onPositiveButtonClick(selection: any) {
                    finish({ start: fromUTC(selection.first), end: fromUTC(selection.second) });
                }
            })
        );
        picker.addOnDismissListener(new android.content.DialogInterface.OnDismissListener({ onDismiss: () => finish(undefined) }));
        picker.show(getFragmentManager(), 'ns-date-range-picker');
    });
}

export function pickTime(options: PickTimeOptions = {}): Promise<Date | undefined> {
    return new Promise((resolve) => {
        const timepicker = com.google.android.material.timepicker;
        const initial = options.time || new Date();
        const is24Hour = options.is24Hour ?? android.text.format.DateFormat.is24HourFormat(Application.android.context);
        const builder = new timepicker.MaterialTimePicker.Builder()
            .setTimeFormat(is24Hour ? timepicker.TimeFormat.CLOCK_24H : timepicker.TimeFormat.CLOCK_12H)
            .setHour(initial.getHours())
            .setMinute(initial.getMinutes())
            .setInputMode(options.inputMode === 'keyboard' ? timepicker.MaterialTimePicker.INPUT_MODE_KEYBOARD : timepicker.MaterialTimePicker.INPUT_MODE_CLOCK);
        if (options.title) {
            builder.setTitleText(options.title);
        }
        if (options.positiveButtonText) {
            builder.setPositiveButtonText(options.positiveButtonText);
        }
        if (options.negativeButtonText) {
            builder.setNegativeButtonText(options.negativeButtonText);
        }
        const picker = builder.build();
        let done = false;
        const finish = (value: Date | undefined) => {
            if (!done) {
                done = true;
                resolve(value);
            }
        };
        picker.addOnPositiveButtonClickListener(
            new android.view.View.OnClickListener({
                onClick: () => {
                    const result = new Date(initial);
                    result.setHours(picker.getHour(), picker.getMinute(), 0, 0);
                    finish(result);
                }
            })
        );
        picker.addOnDismissListener(new android.content.DialogInterface.OnDismissListener({ onDismiss: () => finish(undefined) }));
        picker.show(getFragmentManager(), 'ns-time-picker');
    });
}

export async function pickDateTime(options: PickDateTimeOptions = {}): Promise<Date | undefined> {
    const date = await pickDate(options);
    if (!date) {
        return undefined;
    }
    return pickTime({ time: date, is24Hour: options.is24Hour, inputMode: options.timeInputMode, positiveButtonText: options.positiveButtonText, negativeButtonText: options.negativeButtonText });
}
