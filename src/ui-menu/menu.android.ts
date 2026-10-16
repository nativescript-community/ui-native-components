import { renderFormattedTextToImageSource } from '@nativescript-community/ui-core/formatted-text';
import { FormattedString, GestureTypes, ImageSource, Label, Utils, View } from '@nativescript/core';
import { ContextMenuOptions, MenuItem, ShowMenuOptions, splitSections } from './menu-common';
export * from './menu-common';

// Material 3 error color
const DESTRUCTIVE_COLOR = android.graphics.Color.parseColor('#B3261D');

function getIcon(icon: string | ImageSource | FormattedString): android.graphics.drawable.Drawable {
    if (!icon) {
        return null;
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

function buildMenu(menu: android.view.Menu, items: MenuItem[], registry: Map<number, MenuItem>, state: { nextId: number }) {
    splitSections(items).forEach((section, groupId) => {
        section.forEach((item) => {
            const id = state.nextId++;
            let title: any = item.title || '';
            if (item.destructive || item.subtitle) {
                // the subtitle is a smaller second line
                const text = item.subtitle ? `${title}\n${item.subtitle}` : title;
                const spannable = new android.text.SpannableString(text);
                if (item.destructive) {
                    spannable.setSpan(new android.text.style.ForegroundColorSpan(DESTRUCTIVE_COLOR), 0, title.length, 0);
                }
                if (item.subtitle) {
                    spannable.setSpan(new android.text.style.RelativeSizeSpan(0.8), title.length + 1, text.length, 0);
                    spannable.setSpan(new android.text.style.ForegroundColorSpan(android.graphics.Color.GRAY), title.length + 1, text.length, 0);
                }
                title = spannable;
            }
            let menuItem: android.view.MenuItem;
            if (item.items?.length) {
                const subMenu = menu.addSubMenu(groupId, id, id, title);
                buildMenu(subMenu, item.items, registry, state);
                menuItem = subMenu.getItem();
            } else {
                menuItem = menu.add(groupId, id, id, title);
                registry.set(id, item);
            }
            const icon = getIcon(item.icon);
            if (icon) {
                menuItem.setIcon(icon);
            }
            if (item.checked !== undefined) {
                menuItem.setCheckable(true);
                menuItem.setChecked(!!item.checked);
            }
            menuItem.setEnabled(!item.disabled);
        });
    });
    try {
        // dividers between the sections (API 28)
        (menu as any).setGroupDividerEnabled(true);
    } catch (error) {}
}

export function showMenu(options: ShowMenuOptions): Promise<MenuItem | undefined> {
    return new Promise((resolve) => {
        const anchor = options.anchor?.nativeViewProtected as android.view.View;
        if (!anchor) {
            resolve(undefined);
            return;
        }
        const PopupMenu = (global as any).androidx.appcompat.widget.PopupMenu;
        const placement = options.placement;
        let popupAnchor = anchor;
        let helper: android.view.View;
        if (placement?.vertical === 'above') {
            // the popup always opens below its anchor: a helper view above the anchor, as high as the menu, makes it open above
            const root = anchor.getRootView() as android.view.ViewGroup;
            const location = Array.create('int', 2);
            anchor.getLocationInWindow(location);
            const itemCount = options.items.filter((i) => !i.separator).length;
            const estimatedHeight = Utils.layout.toDevicePixels(itemCount * 48 + 16);
            helper = new android.view.View(anchor.getContext());
            root.addView(helper, new android.widget.FrameLayout.LayoutParams(anchor.getWidth(), 1));
            helper.setX(location[0]);
            helper.setY(Math.max(0, location[1] - estimatedHeight));
            popupAnchor = helper;
        }
        const gravity = placement?.horizontal === 'end' ? android.view.Gravity.END : android.view.Gravity.START;
        const popup = new PopupMenu(anchor.getContext(), popupAnchor, gravity);
        const registry = new Map<number, MenuItem>();
        buildMenu(popup.getMenu(), options.items, registry, { nextId: 1 });
        try {
            popup.setForceShowIcon(true);
        } catch (error) {}
        popup.setOnMenuItemClickListener(
            new PopupMenu.OnMenuItemClickListener({
                onMenuItemClick(menuItem: android.view.MenuItem) {
                    const item = registry.get(menuItem.getItemId());
                    if (!item) {
                        return false;
                    }
                    resolve(item);
                    item.onSelect?.(item);
                    return true;
                }
            })
        );
        // resolving twice is harmless: the click is reported before the dismissal
        popup.setOnDismissListener(
            new PopupMenu.OnDismissListener({
                onDismiss: () => {
                    (helper?.getParent() as android.view.ViewGroup)?.removeView(helper);
                    resolve(undefined);
                }
            })
        );
        popup.show();
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
