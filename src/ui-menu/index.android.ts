import { renderFormattedTextToImageSource } from '@nativescript-community/ui-core/formatted-text';
import { FormattedString, GestureTypes, ImageSource, Label, Utils, View } from '@nativescript/core';
import { ContextMenuOptions, MenuItem, ShowMenuOptions } from './index-common';
import { showPopup } from './menu-popup.android';
export * from './index-common';
export { MenuColors, setMenuColors } from './menu-popup.android';

function getIcon(icon: string | ImageSource | FormattedString): android.graphics.drawable.Drawable {
    if (!icon) {
        return null;
    }
    if (typeof icon === 'string' && icon.startsWith(Utils.RESOURCE_PREFIX)) {
        // a vector drawable (tinted by the theme) cannot be decoded as an image
        const context = Utils.android.getApplicationContext() as android.content.Context;
        const identifier = context.getResources().getIdentifier(icon.slice(Utils.RESOURCE_PREFIX.length), 'drawable', context.getPackageName());
        if (identifier > 0) {
            return androidx.appcompat.content.res.AppCompatResources.getDrawable(context, identifier);
        }
    }
    let source: ImageSource;
    if (icon instanceof FormattedString) {
        source = renderFormattedTextToImageSource(icon, new Label());
    } else if (icon instanceof ImageSource) {
        source = icon;
    } else if (icon.startsWith(Utils.RESOURCE_PREFIX)) {
        source = ImageSource.fromResourceSync(icon.slice(Utils.RESOURCE_PREFIX.length));
    } else if (Utils.isFileOrResourcePath(icon) && !icon.startsWith(Utils.SYSTEM_PREFIX)) {
        source = ImageSource.fromFileSync(icon);
    }
    return source?.android ? new android.graphics.drawable.BitmapDrawable(Utils.android.getApplicationContext().getResources(), source.android) : null;
}

export function showMenu(options: ShowMenuOptions): Promise<MenuItem | undefined> {
    return new Promise((resolve) => {
        const anchor = options.anchor?.nativeViewProtected as android.view.View;
        if (!anchor) {
            resolve(undefined);
            return;
        }
        showPopup({
            anchor,
            items: options.items,
            placement: options.placement,
            getIcon,
            onSelect: (item) => {
                resolve(item);
                item.onSelect?.(item);
            },
            // resolving twice is harmless: the click is reported before the dismissal
            onDismiss: () => resolve(undefined)
        });
    });
}

export function setContextMenu(view: View, options: ContextMenuOptions): () => void {
    const handler = () => {
        const items = typeof options.items === 'function' ? options.items() : options.items;
        showMenu({ anchor: view, items, title: options.title, placement: options.placement }).then((item) => item && options.onSelect?.(item));
    };
    view.on(GestureTypes.longPress as any, handler);
    return () => view.off(GestureTypes.longPress as any, handler);
}

/** icon of a menu / bar item as a drawable: `res://`, a file, an ImageSource or a FormattedString */
export function getNativeIcon(icon: string | ImageSource | FormattedString): android.graphics.drawable.Drawable {
    return getIcon(icon);
}
