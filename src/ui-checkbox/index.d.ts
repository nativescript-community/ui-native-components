/**
 * Checkbox with a label and an indeterminate state.
 * Android uses the Material 3 MaterialCheckBox. iOS uses a toggle button with SF Symbols.
 * @module @nativescript-community/ui-checkbox
 */

import { Color, View } from '@nativescript/core';

export class CheckBox extends View {
    /** name of the event raised when the user toggles the checkbox */
    public static checkedChangeEvent: string;
    /** label next to the box */
    text: string;
    /** the box is checked */
    checked: boolean;
    /** the third state (a minus). A tap clears it */
    indeterminate: boolean;
    /** color of the box when it is checked, the accent color by default */
    checkedColor: Color;
}
