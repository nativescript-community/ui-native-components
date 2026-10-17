import { CSSType, Color, FormattedString, Property, TextField as NTextField } from '@nativescript/core';
import { createNativeFormattedText } from '@nativescript-community/ui-core/formatted-text';
import { cssProperty } from '@nativescript-community/ui-core';
import { VerticalTextAlignment } from '@nativescript-community/text';
import { LineBreak } from '@nativescript-community/ui-core/textbase/cssproperties';

@CSSType('TextField')
export abstract class TextFieldBase extends NTextField {
    abstract requestFocus();
    abstract clearFocus();

    // those 2 are not released yet
    secureWithoutAutofill: boolean;
    closeOnReturn: boolean;

    @cssProperty helper: string;
    @cssProperty helperColor: Color;
    @cssProperty counterMaxLength: number;
    @cssProperty errorColor: Color;
    @cssProperty floating = true;
    @cssProperty placeholderColor: Color;
    @cssProperty variant: 'outline' | 'underline' | 'filled' | 'none' = 'filled';
    @cssProperty error: string;
    @cssProperty strokeColor: Color;
    @cssProperty strokeInactiveColor: Color;
    @cssProperty strokeDisabledColor: Color;
    @cssProperty floatingColor: Color;
    @cssProperty floatingInactiveColor: Color;
    @cssProperty buttonColor: Color;
    @cssProperty digits: string;
    @cssProperty verticalTextAlignment: VerticalTextAlignment;
    @cssProperty lineBreak: LineBreak;

    /**
     * Rich text (spans) of the hint, it wins over `hint`.
     * `@nativescript-community/text` is used when it is installed (optional).
     * Android: the floating label of the TextInputLayout only draws plain text, the spans show in the hint of the field itself (`floating="false"`).
     */
    formattedHint: FormattedString;

    /**
     * @internal native rich text of a FormattedString
     */
    protected createNativeRichText(formatted: FormattedString): any {
        return formatted ? createNativeFormattedText(formatted) : null;
    }
}

export const formattedHintProperty = new Property<TextFieldBase, FormattedString>({ name: 'formattedHint' });
formattedHintProperty.register(TextFieldBase);
