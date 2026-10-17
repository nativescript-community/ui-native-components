/**
 * SearchBar augmented with `variant`. Same API as the core SearchBar (`text`, `hint`, `submit` and `clear` events...).
 * Android: Material 3 search bar look. iOS: native UISearchBar (Liquid Glass on iOS 26+).
 * @module @nativescript-community/ui-searchbar
 */

import { FormattedString, SearchBar as CoreSearchBar } from '@nativescript/core';
import { SearchBarVariant } from './index-common';
export { SearchBarVariant };

export class SearchBar extends CoreSearchBar {
    /**
     * Android: Material 3 search bar, a filled or outlined pill. iOS: the prominent (glass) or minimal UISearchBar. Default: filled
     */
    variant: SearchBarVariant;
    /**
     * Rich text (spans) of the hint, it wins over `hint`.
     * `@nativescript-community/text` is used when installed (optional).
     */
    formattedHint: FormattedString;
    /** Rich text (spans) of the content. It is replaced by the plain text when the user edits it. */
    formattedText: FormattedString;
}
