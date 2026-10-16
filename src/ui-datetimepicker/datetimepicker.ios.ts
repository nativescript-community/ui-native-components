import { Application, Color, Utils } from '@nativescript/core';
import { DateRange, PickDateOptions, PickDateRangeOptions, PickDateTimeOptions, PickTimeOptions, PickerBaseOptions } from './datetimepicker-common';
export * from './datetimepicker-common';

@NativeClass
class PickerPresentationDelegate extends NSObject {
    static ObjCProtocols = [UIAdaptivePresentationControllerDelegate];
    onDismiss: () => void;
    presentationControllerDidDismiss(presentationController: UIPresentationController) {
        this.onDismiss?.();
    }
}

interface PickerConfig extends PickerBaseOptions {
    mode: UIDatePickerMode;
    style: UIDatePickerStyle;
    /** height of the sheet in dip */
    height: number;
    date?: Date;
    minDate?: Date;
    maxDate?: Date;
    minuteInterval?: number;
    is24Hour?: boolean;
    firstDayOfWeek?: number;
}

const toStyle = (style: 'inline' | 'wheels' | undefined, fallback: UIDatePickerStyle) => (style === 'wheels' ? UIDatePickerStyle.Wheels : style === 'inline' ? UIDatePickerStyle.Inline : fallback);

/**
 * A bar button with the title when there is one, else the system glass icon
 */
function createBarButton(systemItem: UIBarButtonSystemItem, title: string | undefined, handler: () => void, prominent: boolean) {
    const action = UIAction.actionWithTitleImageIdentifierHandler(title || '', null, null, handler);
    if (!title) {
        return UIBarButtonItem.alloc().initWithBarButtonSystemItemPrimaryAction(systemItem, action);
    }
    const item = UIBarButtonItem.alloc().initWithPrimaryAction(action);
    if (prominent) {
        item.style = UIBarButtonItemStyle.Done;
    }
    return item;
}

/**
 * Shows a UIDatePicker in a sheet with Cancel/Done buttons
 */
function present(config: PickerConfig): Promise<Date | undefined> {
    return new Promise((resolve) => {
        const picker = UIDatePicker.new();
        picker.datePickerMode = config.mode;
        picker.preferredDatePickerStyle = config.style;
        if (config.date) {
            picker.date = config.date;
        }
        if (config.minDate) {
            picker.minimumDate = config.minDate;
        }
        if (config.maxDate) {
            picker.maximumDate = config.maxDate;
        }
        if (config.minuteInterval) {
            picker.minuteInterval = config.minuteInterval;
        }
        if (config.locale) {
            picker.locale = NSLocale.alloc().initWithLocaleIdentifier(config.locale);
        } else if (config.is24Hour !== undefined) {
            picker.locale = NSLocale.alloc().initWithLocaleIdentifier(config.is24Hour ? 'en_GB' : 'en_US');
        }
        if (config.firstDayOfWeek) {
            const calendar = (picker.calendar as NSCalendar).copy() as NSCalendar;
            calendar.firstWeekday = config.firstDayOfWeek;
            picker.calendar = calendar;
        }
        if (config.tintColor) {
            picker.tintColor = (config.tintColor instanceof Color ? config.tintColor : new Color(config.tintColor as string)).ios;
        }
        const container = UIView.new();
        container.backgroundColor = UIColor.systemBackgroundColor;
        container.addSubview(picker);
        // at the top of the sheet, with its own height
        picker.translatesAutoresizingMaskIntoConstraints = false;
        NSLayoutConstraint.activateConstraints(
            NSArray.arrayWithArray([
                picker.topAnchor.constraintEqualToAnchor(container.safeAreaLayoutGuide.topAnchor),
                picker.leadingAnchor.constraintEqualToAnchor(container.leadingAnchor),
                picker.trailingAnchor.constraintEqualToAnchor(container.trailingAnchor)
            ] as any)
        );

        const controller = UIViewController.new();
        controller.view = container;
        controller.title = config.title || null;
        const navigation = UINavigationController.alloc().initWithRootViewController(controller);

        let done = false;
        const finish = (value: Date | undefined) => {
            if (!done) {
                done = true;
                resolve(value);
            }
        };
        const close = (value: Date | undefined) => {
            finish(value);
            navigation.dismissViewControllerAnimatedCompletion(true, null);
        };
        controller.navigationItem.leftBarButtonItem = createBarButton(UIBarButtonSystemItem.Cancel, config.negativeButtonText, () => close(undefined), false);
        controller.navigationItem.rightBarButtonItem = createBarButton(UIBarButtonSystemItem.Done, config.positiveButtonText, () => close(picker.date as any as Date), true);

        navigation.modalPresentationStyle = UIModalPresentationStyle.PageSheet;
        const sheet = navigation.sheetPresentationController;
        if (sheet) {
            sheet.detents = NSArray.arrayWithArray([
                UISheetPresentationControllerDetent.customDetentWithIdentifierResolver('picker', (context) => Math.min(config.height, context.maximumDetentValue))
            ] as any);
            sheet.prefersGrabberVisible = true;
        }
        // dismissed by the user (swipe down)
        const delegate = PickerPresentationDelegate.new() as PickerPresentationDelegate;
        delegate.onDismiss = () => finish(undefined);
        (navigation as any)._delegate = delegate;
        navigation.presentationController.delegate = delegate;

        Utils.ios.getVisibleViewController(Application.ios.rootController).presentViewControllerAnimatedCompletion(navigation, true, null);
    });
}

export function pickDate(options: PickDateOptions = {}): Promise<Date | undefined> {
    const style = toStyle(options.style, UIDatePickerStyle.Inline);
    return present({ ...options, mode: UIDatePickerMode.Date, style, height: style === UIDatePickerStyle.Wheels ? 300 : 480 });
}

export function pickTime(options: PickTimeOptions = {}): Promise<Date | undefined> {
    return present({ ...options, mode: UIDatePickerMode.Time, style: UIDatePickerStyle.Wheels, height: 300, date: options.time });
}

export function pickDateTime(options: PickDateTimeOptions = {}): Promise<Date | undefined> {
    const style = toStyle(options.style, UIDatePickerStyle.Inline);
    return present({ ...options, mode: UIDatePickerMode.DateAndTime, style, height: style === UIDatePickerStyle.Wheels ? 300 : 540 });
}

/**
 * UIDatePicker has no range: the start is picked, then the end (not before the start)
 */
export async function pickDateRange(options: PickDateRangeOptions = {}): Promise<DateRange | undefined> {
    const { start: initialStart, end: initialEnd, endTitle, ...pickerOptions } = options;
    const start = await pickDate({ ...pickerOptions, date: initialStart });
    if (!start) {
        return undefined;
    }
    const end = await pickDate({ ...pickerOptions, title: endTitle || 'End date', date: initialEnd && initialEnd >= start ? initialEnd : start, minDate: start });
    return end ? { start, end } : undefined;
}
