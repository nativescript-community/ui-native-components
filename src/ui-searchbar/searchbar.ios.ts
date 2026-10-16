import { SearchBarCommon, SearchBarVariant, variantProperty } from './searchbar-common';
export * from './searchbar-common';

/**
 * iOS: the native UISearchBar, which has the Liquid Glass look on iOS 26+
 */
export class SearchBar extends SearchBarCommon {
    [variantProperty.setNative](value: SearchBarVariant) {
        const minimal = value === 'minimal' || value === 'outline';
        (this.nativeViewProtected as UISearchBar).searchBarStyle = minimal ? UISearchBarStyle.Minimal : UISearchBarStyle.Prominent;
    }
}
