import { Application } from '@nativescript/core';
import { PickDateOptions, PickDateTimeOptions, PickTimeOptions } from './datetimepicker-common';
export * from './datetimepicker-common';

function getFragmentManager(): androidx.fragment.app.FragmentManager {
    const activity = (Application.android.foregroundActivity || Application.android.startActivity) as androidx.appcompat.app.AppCompatActivity;
    return activity.getSupportFragmentManager();
}

/**
 * MaterialDatePicker works with the UTC midnight of the days
 */
const toUTC = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

export function pickDate(options: PickDateOptions = {}): Promise<Date | undefined> {
    return new Promise((resolve) => {
        const datepicker = com.google.android.material.datepicker;
        const initial = options.date || new Date();
        const builder = datepicker.MaterialDatePicker.Builder.datePicker();
        builder.setSelection(java.lang.Long.valueOf(toUTC(initial)));
        if (options.title) {
            builder.setTitleText(options.title);
        }
        if (options.minDate || options.maxDate) {
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
            constraints.setValidator(datepicker.CompositeDateValidator.allOf(validators));
            builder.setCalendarConstraints(constraints.build());
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
            new datepicker.MaterialPickerOnPositiveButtonClickListener({
                onPositiveButtonClick(selection: any) {
                    // the runtime gives the java.lang.Long as a number
                    const utc = new Date(typeof selection === 'number' ? selection : (selection as java.lang.Long).longValue());
                    // the day picked, with the time of the initial date
                    finish(new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate(), initial.getHours(), initial.getMinutes(), initial.getSeconds()));
                }
            })
        );
        // the positive button is handled before the dismissal
        picker.addOnDismissListener(new android.content.DialogInterface.OnDismissListener({ onDismiss: () => finish(undefined) }));
        picker.show(getFragmentManager(), 'ns-date-picker');
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
    return pickTime({ time: date, is24Hour: options.is24Hour, inputMode: options.inputMode });
}
