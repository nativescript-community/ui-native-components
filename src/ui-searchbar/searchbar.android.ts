import { Application, Utils } from '@nativescript/core';
import { SearchBarCommon, SearchBarVariant, variantProperty } from './searchbar-common';
export * from './searchbar-common';

const HEIGHT_DP = 56;

function themeColor(context: android.content.Context, attr: number, fallback: number) {
    const value = new android.util.TypedValue();
    return context.getTheme().resolveAttribute(attr, value, true) ? value.data : fallback;
}

function id(context: android.content.Context, name: string) {
    return context.getResources().getIdentifier(name, 'id', context.getPackageName());
}

/**
 * Android: the androidx SearchView of the core SearchBar, styled as a Material 3 search bar:
 * a pill (28dp radius, 56dp high) filled with the surface container color, or outlined.
 */
export class SearchBar extends SearchBarCommon {
    public initNativeView(): void {
        super.initNativeView();
        this.styleSearchView();
    }

    private styleSearchView() {
        const searchView = this.nativeViewProtected as androidx.appcompat.widget.SearchView;
        const context = searchView.getContext();
        const R = (com.google.android.material as any).R;
        const onSurface = themeColor(context, R.attr.colorOnSurface, android.graphics.Color.BLACK);
        const onSurfaceVariant = themeColor(context, R.attr.colorOnSurfaceVariant, android.graphics.Color.GRAY);
        const height = Utils.layout.toDevicePixels(HEIGHT_DP);
        searchView.setIconifiedByDefault(false);
        searchView.setMaxWidth(java.lang.Integer.MAX_VALUE);
        searchView.setMinimumHeight(height);
        searchView.setPadding(Utils.layout.toDevicePixels(8), 0, Utils.layout.toDevicePixels(8), 0);

        // the parts of the SearchView: no underline, M3 colors
        const plate = searchView.findViewById(id(context, 'search_plate'));
        plate?.setBackground(null);
        const frame = searchView.findViewById(id(context, 'search_edit_frame'));
        frame?.setBackground(null);
        const text = searchView.findViewById(id(context, 'search_src_text')) as android.widget.EditText;
        if (text) {
            text.setTextColor(onSurface);
            text.setHintTextColor(onSurfaceVariant);
            text.setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 16);
        }
        for (const name of ['search_mag_icon', 'search_button', 'search_close_btn', 'search_go_btn']) {
            const icon = searchView.findViewById(id(context, name)) as android.widget.ImageView;
            icon?.setColorFilter(onSurfaceVariant, android.graphics.PorterDuff.Mode.SRC_IN);
        }
        this.applyVariant(this.variant);
    }

    private applyVariant(variant: SearchBarVariant) {
        const searchView = this.nativeViewProtected as androidx.appcompat.widget.SearchView;
        if (!searchView) {
            return;
        }
        const context = searchView.getContext();
        const R = (com.google.android.material as any).R;
        const outlined = variant === 'outline' || variant === 'minimal';
        const background = new android.graphics.drawable.GradientDrawable();
        background.setCornerRadius(Utils.layout.toDevicePixels(HEIGHT_DP / 2));
        if (outlined) {
            background.setColor(android.graphics.Color.TRANSPARENT);
            background.setStroke(Utils.layout.toDevicePixels(1), themeColor(context, R.attr.colorOutline, android.graphics.Color.GRAY));
        } else {
            background.setColor(themeColor(context, R.attr.colorSurfaceContainerHigh, android.graphics.Color.LTGRAY));
        }
        searchView.setBackground(background);
    }

    [variantProperty.setNative](value: SearchBarVariant) {
        this.applyVariant(value);
    }
}
