import { Background, Color, Utils, backgroundColorProperty, backgroundInternalProperty } from '@nativescript/core';
import { SearchBarCommon, SearchBarVariant, formattedHintProperty, formattedTextProperty, variantProperty } from './index-common';
export * from './index-common';

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

    private mUserColor: Color;
    private mUserBackground: Background;

    private applyVariant(variant: SearchBarVariant) {
        const searchView = this.nativeViewProtected as androidx.appcompat.widget.SearchView;
        if (!searchView) {
            return;
        }
        const context = searchView.getContext();
        const R = (com.google.android.material as any).R;
        const outlined = variant === 'outline' || variant === 'minimal';
        const user = this.mUserBackground;
        const background = new android.graphics.drawable.GradientDrawable();
        // background-color, border and border-radius of the view replace the ones of the variant
        const radius = user?.borderTopLeftRadius ? Utils.layout.toDevicePixels(user.borderTopLeftRadius) : Utils.layout.toDevicePixels(HEIGHT_DP / 2);
        background.setCornerRadius(radius);
        if (this.mUserColor) {
            background.setColor(this.mUserColor.android);
        } else if (outlined) {
            background.setColor(android.graphics.Color.TRANSPARENT);
        } else {
            background.setColor(themeColor(context, R.attr.colorSurfaceContainerHigh, android.graphics.Color.LTGRAY));
        }
        if (user?.borderTopWidth) {
            background.setStroke(Utils.layout.toDevicePixels(user.borderTopWidth), user.borderTopColor ? user.borderTopColor.android : android.graphics.Color.GRAY);
        } else if (outlined) {
            background.setStroke(Utils.layout.toDevicePixels(1), themeColor(context, R.attr.colorOutline, android.graphics.Color.GRAY));
        }
        searchView.setBackground(background);
    }

    private get editText(): android.widget.EditText {
        const searchView = this.nativeViewProtected as androidx.appcompat.widget.SearchView;
        return searchView.findViewById(id(searchView.getContext(), 'search_src_text')) as android.widget.EditText;
    }

    [formattedHintProperty.setNative](value) {
        // a hint can be a spannable: the plain hint of the core SearchBar is restored without spans
        this.editText?.setHint(value ? this.createNativeRichText(value) : this.hint || '');
    }

    [formattedTextProperty.setNative](value) {
        if (value) {
            this.editText?.setText(this.createNativeRichText(value));
        }
    }

    [backgroundColorProperty.setNative](value: Color) {
        this.mUserColor = value instanceof Color ? value : value ? new Color(value as any) : null;
        this.applyVariant(this.variant);
    }
    [backgroundInternalProperty.setNative](value: Background) {
        this.mUserBackground = value;
        this.applyVariant(this.variant);
    }

    [variantProperty.setNative](value: SearchBarVariant) {
        this.applyVariant(value);
    }
}
