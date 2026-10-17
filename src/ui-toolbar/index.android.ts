import { Color, Font, FormattedString, ImageSource, Utils, colorProperty } from '@nativescript/core';
import { renderFormattedTextToImageSource } from '@nativescript-community/ui-core/formatted-text';
import { ToolbarBase, ToolbarItem, centerTitleProperty, itemsProperty, navigationIconProperty, subtitleProperty, titleProperty } from './index-common';
export * from './index-common';

type Icon = string | ImageSource | FormattedString;

function toDrawable(icon: Icon, font?: Font, color?: Color): android.graphics.drawable.Drawable {
    if (!icon) {
        return null;
    }
    let source: ImageSource;
    if (icon instanceof FormattedString) {
        source = renderFormattedTextToImageSource(icon, undefined);
    } else if (icon instanceof ImageSource) {
        source = icon;
    } else if (Utils.isFontIconURI(icon)) {
        // an icon font glyph, drawn with the font-family and the color of the toolbar
        source = ImageSource.fromFontIconCodeSync(icon.split('//')[1], (font || Font.default).withFontSize(24), color || new Color('black'));
    } else if (icon.startsWith(Utils.RESOURCE_PREFIX)) {
        source = ImageSource.fromResourceSync(icon.slice(Utils.RESOURCE_PREFIX.length));
    } else if (!icon.startsWith(Utils.SYSTEM_PREFIX) && Utils.isFileOrResourcePath(icon)) {
        source = ImageSource.fromFileSync(icon);
    }
    return source?.android ? new android.graphics.drawable.BitmapDrawable(Utils.android.getApplicationContext().getResources(), source.android) : null;
}

/**
 * Android: Material 3 MaterialToolbar. The actions are the menu of the toolbar, those with `showAsAction: 'never'` are in the overflow menu.
 */
export class Toolbar extends ToolbarBase {
    nativeViewProtected: com.google.android.material.appbar.MaterialToolbar;
    private mColor: Color;

    public createNativeView() {
        return new com.google.android.material.appbar.MaterialToolbar(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        const owner = new WeakRef(this);
        const toolbar = this.nativeViewProtected;
        // Material 3 surface colors, whatever the toolbar style of the app theme: replaced by `background-color` and `color`
        const context = toolbar.getContext();
        const R = (com.google.android.material as any).R;
        const themeColor = (attr: number, fallback: number) => {
            const value = new android.util.TypedValue();
            return context.getTheme().resolveAttribute(attr, value, true) ? value.data : fallback;
        };
        const onSurface = themeColor(R.attr.colorOnSurface, android.graphics.Color.BLACK);
        toolbar.setBackgroundColor(themeColor(R.attr.colorSurface, android.graphics.Color.WHITE));
        toolbar.setTitleTextColor(onSurface);
        toolbar.setSubtitleTextColor(themeColor(R.attr.colorOnSurfaceVariant, android.graphics.Color.GRAY));
        this.mColor = new Color(onSurface);
        toolbar.setNavigationOnClickListener(new android.view.View.OnClickListener({ onClick: () => owner.get()?.notifyNavigationTap() }));
        toolbar.setOnMenuItemClickListener(
            new androidx.appcompat.widget.Toolbar.OnMenuItemClickListener({
                onMenuItemClick(menuItem: android.view.MenuItem) {
                    const view = owner.get();
                    const item = view?.items?.[menuItem.getItemId()];
                    if (!item) {
                        return false;
                    }
                    view.notifyItemTap(item);
                    return true;
                }
            })
        );
    }

    public disposeNativeView() {
        this.nativeViewProtected?.setNavigationOnClickListener(null);
        this.nativeViewProtected?.setOnMenuItemClickListener(null);
        super.disposeNativeView();
    }

    // the spans icons keep their own colors
    private tint(drawable: android.graphics.drawable.Drawable, icon?: Icon) {
        if (drawable && this.mColor && !(icon instanceof FormattedString)) {
            drawable.setTint(this.mColor.android);
        }
        return drawable;
    }

    private updateItems() {
        const toolbar = this.nativeViewProtected;
        if (!toolbar) {
            return;
        }
        const menu = toolbar.getMenu();
        menu.clear();
        this.items?.forEach((item: ToolbarItem, index) => {
            const icon = toDrawable(item.androidIcon || item.icon, this.style.fontInternal, this.mColor);
            const menuItem = menu.add(0, index, index, item.title || '');
            if (icon) {
                menuItem.setIcon(this.tint(icon, item.androidIcon || item.icon));
            }
            const MenuItem = android.view.MenuItem;
            const show = item.showAsAction || (icon ? 'always' : 'never');
            menuItem.setShowAsAction(show === 'always' ? MenuItem.SHOW_AS_ACTION_ALWAYS : show === 'ifRoom' ? MenuItem.SHOW_AS_ACTION_IF_ROOM : MenuItem.SHOW_AS_ACTION_NEVER);
            menuItem.setEnabled(!item.disabled);
        });
    }

    [titleProperty.setNative](value: string) {
        this.nativeViewProtected.setTitle(value || null);
    }
    [subtitleProperty.setNative](value: string) {
        this.nativeViewProtected.setSubtitle(value || null);
    }
    [centerTitleProperty.setNative](value: boolean) {
        this.nativeViewProtected.setTitleCentered(!!value);
        this.nativeViewProtected.setSubtitleCentered(!!value);
    }
    private updateNavigationIcon() {
        this.nativeViewProtected?.setNavigationIcon(this.tint(toDrawable(this.navigationIcon, this.style.fontInternal, this.mColor), this.navigationIcon));
    }
    [navigationIconProperty.setNative](value: Icon) {
        this.updateNavigationIcon();
    }
    [itemsProperty.setNative](value: ToolbarItem[]) {
        this.updateItems();
    }
    [colorProperty.setNative](value: Color) {
        this.mColor = value instanceof Color ? value : value ? new Color(value as any) : null;
        const toolbar = this.nativeViewProtected;
        if (this.mColor) {
            toolbar.setTitleTextColor(this.mColor.android);
            toolbar.setSubtitleTextColor(this.mColor.android);
        }
        // the icons already set follow the color
        this.updateItems();
        this.updateNavigationIcon();
    }
}
