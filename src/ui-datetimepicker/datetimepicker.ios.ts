import { Application, Utils } from '@nativescript/core';
import { PickDateOptions, PickDateTimeOptions, PickTimeOptions } from './datetimepicker-common';
export * from './datetimepicker-common';

@NativeClass
class PickerPresentationDelegate extends NSObject {
    static ObjCProtocols = [UIAdaptivePresentationControllerDelegate];
    onDismiss: () => void;
    presentationControllerDidDismiss(presentationController: UIPresentationController) {
        this.onDismiss?.();
    }
}

interface PickerConfig {
    mode: UIDatePickerMode;
    style: UIDatePickerStyle;
    /** height of the sheet in dip */
    height: number;
    title?: string;
    date?: Date;
    minDate?: Date;
    maxDate?: Date;
    minuteInterval?: number;
    is24Hour?: boolean;
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
        if (config.is24Hour !== undefined) {
            picker.locale = NSLocale.alloc().initWithLocaleIdentifier(config.is24Hour ? 'en_GB' : 'en_US');
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
        controller.navigationItem.leftBarButtonItem = UIBarButtonItem.alloc().initWithBarButtonSystemItemPrimaryAction(
            UIBarButtonSystemItem.Cancel,
            UIAction.actionWithTitleImageIdentifierHandler('', null, null, () => close(undefined))
        );
        controller.navigationItem.rightBarButtonItem = UIBarButtonItem.alloc().initWithBarButtonSystemItemPrimaryAction(
            UIBarButtonSystemItem.Done,
            UIAction.actionWithTitleImageIdentifierHandler('', null, null, () => close(picker.date as any as Date))
        );

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
    return present({ mode: UIDatePickerMode.Date, style: UIDatePickerStyle.Inline, height: 480, ...options });
}

export function pickTime(options: PickTimeOptions = {}): Promise<Date | undefined> {
    return present({ mode: UIDatePickerMode.Time, style: UIDatePickerStyle.Wheels, height: 300, title: options.title, date: options.time, is24Hour: options.is24Hour, minuteInterval: options.minuteInterval });
}

export function pickDateTime(options: PickDateTimeOptions = {}): Promise<Date | undefined> {
    return present({ mode: UIDatePickerMode.DateAndTime, style: UIDatePickerStyle.Inline, height: 540, ...options });
}
