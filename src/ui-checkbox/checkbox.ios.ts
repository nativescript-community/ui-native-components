import { Color, Font, Utils, colorProperty, fontInternalProperty, paddingBottomProperty, paddingLeftProperty, paddingRightProperty, paddingTopProperty } from '@nativescript/core';
import { CheckBoxBase, checkedColorProperty, checkedProperty, indeterminateProperty, textProperty } from './checkbox-common';
export * from './checkbox-common';

// the effective paddings are in device pixels
const dip = (value: number) => Utils.layout.toDeviceIndependentPixels(value);

@NativeClass
class TapHandler extends NSObject {
    _owner: WeakRef<CheckBox>;
    static initWithOwner(owner: CheckBox) {
        const handler = TapHandler.new() as TapHandler;
        handler._owner = new WeakRef(owner);
        return handler;
    }
    toggle() {
        this._owner.get()?._onTap();
    }
    static ObjCExposedMethods = {
        toggle: { returns: interop.types.void, params: [] }
    };
}

/**
 * iOS: a UIButton showing an SF Symbol: square, checkmark.square.fill, minus.square.fill
 */
export class CheckBox extends CheckBoxBase {
    nativeViewProtected: UIButton;
    private mHandler: TapHandler;
    private mTextColor: UIColor;
    private mFont: UIFont;

    public createNativeView() {
        const button = UIButton.buttonWithType(UIButtonType.System);
        button.configuration = UIButtonConfiguration.plainButtonConfiguration();
        button.contentHorizontalAlignment = UIControlContentHorizontalAlignment.Leading;
        return button;
    }

    public initNativeView(): void {
        super.initNativeView();
        this.mHandler = TapHandler.initWithOwner(this);
        this.nativeViewProtected.addTargetActionForControlEvents(this.mHandler, 'toggle', UIControlEvents.TouchUpInside);
        this.updateConfiguration();
    }

    public disposeNativeView() {
        this.mHandler = null;
        super.disposeNativeView();
    }

    _onTap() {
        // a tap clears the indeterminate state and toggles
        const checked = this.indeterminate ? true : !this.checked;
        if (this.indeterminate) {
            indeterminateProperty.nativeValueChange(this, false);
        }
        checkedProperty.nativeValueChange(this, checked);
        this.updateConfiguration();
    }

    private updateConfiguration() {
        const button = this.nativeViewProtected;
        if (!button) {
            return;
        }
        const configuration = button.configuration || UIButtonConfiguration.plainButtonConfiguration();
        const symbol = this.indeterminate ? 'minus.square.fill' : this.checked ? 'checkmark.square.fill' : 'square';
        configuration.image = UIImage.systemImageNamed(symbol);
        configuration.imagePadding = 10;
        // the css padding, else a small vertical inset
        const hasPadding = this.effectivePaddingTop || this.effectivePaddingRight || this.effectivePaddingBottom || this.effectivePaddingLeft;
        configuration.contentInsets = (hasPadding
            ? { top: dip(this.effectivePaddingTop), leading: dip(this.effectivePaddingLeft), bottom: dip(this.effectivePaddingBottom), trailing: dip(this.effectivePaddingRight) }
            : { top: 6, leading: 0, bottom: 6, trailing: 0 }) as any;
        const selected = this.checked || this.indeterminate;
        const accent = this.checkedColor?.ios;
        // the box is tinted by the foreground color, the label keeps its own color
        configuration.baseForegroundColor = selected ? accent || null : UIColor.secondaryLabelColor;
        const title = this.text || '';
        if (title) {
            const attributes = NSMutableDictionary.new<string, any>();
            attributes.setValueForKey(this.mTextColor || UIColor.labelColor, NSForegroundColorAttributeName);
            if (this.mFont) {
                attributes.setValueForKey(this.mFont, NSFontAttributeName);
            }
            configuration.attributedTitle = NSAttributedString.alloc().initWithStringAttributes(title, attributes);
        } else {
            configuration.attributedTitle = null;
        }
        button.configuration = configuration;
        button.accessibilityTraits = selected ? UIAccessibilityTraitButton | UIAccessibilityTraitSelected : UIAccessibilityTraitButton;
    }

    [textProperty.setNative](value: string) {
        this.updateConfiguration();
    }
    [checkedProperty.setNative](value: boolean) {
        this.updateConfiguration();
    }
    [indeterminateProperty.setNative](value: boolean) {
        this.updateConfiguration();
    }
    [colorProperty.setNative](value: Color) {
        this.mTextColor = value?.ios;
        this.updateConfiguration();
    }
    [fontInternalProperty.setNative](value: Font) {
        this.mFont = value?.getUIFont?.(UIFont.systemFontOfSize(17));
        this.updateConfiguration();
    }
    [paddingTopProperty.setNative](value) {
        this.updateConfiguration();
    }
    [paddingRightProperty.setNative](value) {
        this.updateConfiguration();
    }
    [paddingBottomProperty.setNative](value) {
        this.updateConfiguration();
    }
    [paddingLeftProperty.setNative](value) {
        this.updateConfiguration();
    }
    [checkedColorProperty.setNative](value: Color) {
        this.updateConfiguration();
    }
}
