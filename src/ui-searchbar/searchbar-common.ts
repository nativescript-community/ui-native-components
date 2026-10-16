import { CSSType, Property, SearchBar as CoreSearchBar } from '@nativescript/core';

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
}

export const variantProperty = new Property<SearchBarCommon, SearchBarVariant>({ name: 'variant', defaultValue: 'filled' });
variantProperty.register(SearchBarCommon);
