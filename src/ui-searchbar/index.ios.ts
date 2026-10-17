import { Background, backgroundInternalProperty } from '@nativescript/core';
import { applyBorderBackground } from '@nativescript-community/ui-core/border-background';
import { SearchBarCommon, SearchBarVariant, formattedHintProperty, formattedTextProperty, variantProperty } from './index-common';
export * from './index-common';

/**
 * iOS: the native UISearchBar, which has the Liquid Glass look on iOS 26+
 */
export class SearchBar extends SearchBarCommon {
    private get searchTextField(): UITextField {
        return (this.nativeViewProtected as UISearchBar).searchTextField;
    }

    [formattedHintProperty.setNative](value) {
        // without spans the plain hint of the core SearchBar is restored
        this.searchTextField.attributedPlaceholder = value ? this.createNativeRichText(value) : this.hint ? NSAttributedString.alloc().initWithString(this.hint) : null;
    }

    [formattedTextProperty.setNative](value) {
        if (value) {
            this.searchTextField.attributedText = this.createNativeRichText(value);
        }
    }

    // the core discards the background of the SearchBar (the color is the color of the bar): the border and the radius are still drawn
    [backgroundInternalProperty.setNative](value: Background) {
        applyBorderBackground(this, value);
    }

    [variantProperty.setNative](value: SearchBarVariant) {
        const minimal = value === 'minimal' || value === 'outline';
        (this.nativeViewProtected as UISearchBar).searchBarStyle = minimal ? UISearchBarStyle.Minimal : UISearchBarStyle.Prominent;
    }
}
