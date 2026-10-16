import { CSSType, Color, CssProperty, Property, Style, View, booleanConverter } from '@nativescript/core';

/**
 * A checkbox with a label and an indeterminate state.
 * Android uses the Material 3 MaterialCheckBox. iOS has no checkbox on the iPhone: a toggle button with SF Symbols, as in the HIG lists.
 */
@CSSType('CheckBox')
export abstract class CheckBoxBase extends View {
    public static checkedChangeEvent = 'checkedChange';

    /** label next to the box */
    public text: string;
    /** the box is checked. The `checkedChange` event is raised when the user toggles it */
    public checked: boolean;
    /** the third state (a minus), for a parent checkbox of a partially checked group. A tap clears it */
    public indeterminate: boolean;

    get checkedColor(): Color {
        return (this.style as any).checkedColor;
    }
    set checkedColor(value: Color) {
        (this.style as any).checkedColor = value;
    }
}

export const textProperty = new Property<CheckBoxBase, string>({ name: 'text', defaultValue: '' });
textProperty.register(CheckBoxBase);
export const checkedProperty = new Property<CheckBoxBase, boolean>({ name: 'checked', defaultValue: false, valueConverter: booleanConverter });
checkedProperty.register(CheckBoxBase);
export const indeterminateProperty = new Property<CheckBoxBase, boolean>({ name: 'indeterminate', defaultValue: false, valueConverter: booleanConverter });
indeterminateProperty.register(CheckBoxBase);

/** color of the box when it is checked */
export const checkedColorProperty = new CssProperty<Style, Color>({
    name: 'checkedColor',
    cssName: 'checked-color',
    equalityComparer: Color.equals,
    valueConverter: (v) => new Color(v)
});
checkedColorProperty.register(Style);
