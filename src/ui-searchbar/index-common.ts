import { CSSType, FormattedString, Property, SearchBar as CoreSearchBar } from '@nativescript/core';
import { createNativeFormattedText } from '@nativescript-community/ui-core/formatted-text';

/**
 * `filled` and `outline` are the Material names, `prominent` and `minimal` the UISearchBar styles:
 * filled = prominent, outline = minimal.
 */
export type SearchBarVariant = 'filled' | 'outline' | 'prominent' | 'minimal';

@CSSType('SearchBar')
export abstract class SearchBarCommon extends CoreSearchBar {
    /**
     * Android: Material 3 search bar, a filled or outlined pill. iOS: the prominent (glass) or minimal UISearchBar. Default: filled
     */
    public variant: SearchBarVariant;

    /**
     * Rich text (spans) of the hint, it wins over `hint`.
     * `@nativescript-community/text` is used when it is installed (optional).
     */
    public formattedHint: FormattedString;

    /**
     * Rich text (spans) of the content. It is replaced by the plain text when the user edits it.
     */
    public formattedText: FormattedString;

    /**
     * Native rich text (SpannableString on Android, NSAttributedString on iOS) of a FormattedString
     * @internal
     */
    protected createNativeRichText(formatted: FormattedString): any {
        return formatted ? createNativeFormattedText(formatted) : null;
    }
}

export const variantProperty = new Property<SearchBarCommon, SearchBarVariant>({ name: 'variant', defaultValue: 'filled' });
variantProperty.register(SearchBarCommon);

export const formattedHintProperty = new Property<SearchBarCommon, FormattedString>({ name: 'formattedHint' });
formattedHintProperty.register(SearchBarCommon);
export const formattedTextProperty = new Property<SearchBarCommon, FormattedString>({ name: 'formattedText' });
formattedTextProperty.register(SearchBarCommon);
