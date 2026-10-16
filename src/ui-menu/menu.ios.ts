import { Application, ImageSource, Utils, View } from '@nativescript/core';
import { ContextMenuOptions, MenuItem, ShowMenuOptions, splitSections } from './menu-common';
export * from './menu-common';

function getIcon(icon: string): UIImage {
    if (!icon) {
        return null;
    }
    if (icon.startsWith(Utils.SYSTEM_PREFIX)) {
        return UIImage.systemImageNamed(icon.slice(Utils.SYSTEM_PREFIX.length));
    }
    const source = icon.startsWith(Utils.RESOURCE_PREFIX) ? ImageSource.fromResourceSync(icon.slice(Utils.RESOURCE_PREFIX.length)) : ImageSource.fromFileSync(icon);
    return source?.ios;
}

/**
 * Native UIMenu: the sections are inline groups, the submenus are nested menus
 */
function buildMenu(title: string, items: MenuItem[], onPick: (item: MenuItem) => void): UIMenu {
    const sections = splitSections(items).map((section) => {
        const elements = section.map((item) => {
            const image = getIcon(item.icon);
            let attributes = 0;
            if (item.destructive) {
                attributes |= UIMenuElementAttributes.Destructive;
            }
            if (item.disabled) {
                attributes |= UIMenuElementAttributes.Disabled;
            }
            if (item.items?.length) {
                const submenu = buildMenu(item.title || '', item.items, onPick);
                return UIMenu.menuWithTitleImageIdentifierOptionsChildren(item.title || '', image, null, item.destructive ? UIMenuOptions.Destructive : (0 as UIMenuOptions), submenu.children);
            }
            const action = UIAction.actionWithTitleImageIdentifierHandler(item.title || '', image, null, () => onPick(item));
            action.attributes = attributes;
            if (item.checked) {
                action.state = UIMenuElementState.On;
            }
            if (item.subtitle) {
                action.subtitle = item.subtitle;
            }
            return action;
        });
        return UIMenu.menuWithTitleImageIdentifierOptionsChildren('', null, null, UIMenuOptions.DisplayInline, elements as any);
    });
    return UIMenu.menuWithTitleChildren(title || '', sections as any);
}

@NativeClass
class MenuInteractionDelegate extends NSObject implements UIContextMenuInteractionDelegate {
    static ObjCProtocols = [UIContextMenuInteractionDelegate];
    provider: () => UIMenu;
    onEnd: () => void;

    static initWithProvider(provider: () => UIMenu, onEnd?: () => void) {
        const delegate = MenuInteractionDelegate.new() as MenuInteractionDelegate;
        delegate.provider = provider;
        delegate.onEnd = onEnd;
        return delegate;
    }

    contextMenuInteractionConfigurationForMenuAtLocation(interaction: UIContextMenuInteraction, location: CGPoint): UIContextMenuConfiguration {
        return UIContextMenuConfiguration.configurationWithIdentifierPreviewProviderActionProvider(null, null, () => this.provider());
    }

    contextMenuInteractionWillEndForConfigurationAnimator(interaction: UIContextMenuInteraction, configuration: UIContextMenuConfiguration, animator: UIContextMenuInteractionAnimating) {
        animator?.addCompletion(() => this.onEnd?.());
    }
}

/**
 * Before iOS 17.4 a menu can not be presented from the code: an action sheet shows the (flattened) items
 */
function showActionSheet(options: ShowMenuOptions, resolve: (item: MenuItem | undefined) => void) {
    const sheet = UIAlertController.alertControllerWithTitleMessagePreferredStyle(options.title || null, null, UIAlertControllerStyle.ActionSheet);
    const addItems = (items: MenuItem[], prefix = '') => {
        items.forEach((item) => {
            if (item.separator) {
                return;
            }
            if (item.items?.length) {
                addItems(item.items, `${prefix}${item.title} › `);
                return;
            }
            const style = item.destructive ? UIAlertActionStyle.Destructive : UIAlertActionStyle.Default;
            const action = UIAlertAction.actionWithTitleStyleHandler(prefix + (item.title || ''), style, () => {
                resolve(item);
                item.onSelect?.(item);
            });
            action.enabled = !item.disabled;
            sheet.addAction(action);
        });
    };
    addItems(options.items);
    sheet.addAction(UIAlertAction.actionWithTitleStyleHandler('Cancel', UIAlertActionStyle.Cancel, () => resolve(undefined)));
    const anchor = options.anchor.nativeViewProtected as UIView;
    const popover = sheet.popoverPresentationController;
    if (popover) {
        popover.sourceView = anchor;
        popover.sourceRect = anchor.bounds;
    }
    Utils.ios.getVisibleViewController(Application.ios.rootController).presentViewControllerAnimatedCompletion(sheet, true, null);
}

export function showMenu(options: ShowMenuOptions): Promise<MenuItem | undefined> {
    return new Promise((resolve) => {
        const anchor = options.anchor?.nativeViewProtected as UIView;
        if (!anchor) {
            resolve(undefined);
            return;
        }
        // a menu can only be shown by a UIButton: an invisible one covers the anchor
        const button = UIButton.buttonWithType(UIButtonType.Custom);
        if (typeof (button as any).performPrimaryAction !== 'function') {
            showActionSheet(options, resolve);
            return;
        }
        let picked = false;
        const done = (item: MenuItem | undefined) => {
            resolve(item);
            // after the dismissal animation
            setTimeout(() => button.removeFromSuperview(), 500);
        };
        const pick = (item: MenuItem) => {
            picked = true;
            done(item);
            item.onSelect?.(item);
        };
        button.frame = anchor.bounds;
        button.menu = buildMenu(options.title, options.items, pick);
        button.showsMenuAsPrimaryAction = true;
        anchor.addSubview(button);
        (button as any).performPrimaryAction();
        // the button is highlighted while the menu is shown
        let wasShown = false;
        let ticks = 0;
        const timer = setInterval(() => {
            ticks++;
            if (button.highlighted) {
                wasShown = true;
            } else if (wasShown || ticks > 20) {
                clearInterval(timer);
                // the action handler is called after the dismissal animation
                setTimeout(() => !picked && done(undefined), 400);
            }
        }, 100);
    });
}

export function setContextMenu(view: View, options: ContextMenuOptions): () => void {
    let interaction: UIContextMenuInteraction;
    let delegate: MenuInteractionDelegate;
    let nativeView: UIView;
    const attach = () => {
        if (!view.nativeViewProtected || interaction) {
            return;
        }
        nativeView = view.nativeViewProtected as UIView;
        delegate = MenuInteractionDelegate.initWithProvider(() => {
            const items = typeof options.items === 'function' ? options.items() : options.items;
            return buildMenu(options.title, items, (item) => {
                options.onSelect?.(item);
                item.onSelect?.(item);
            });
        });
        interaction = UIContextMenuInteraction.alloc().initWithDelegate(delegate);
        nativeView.addInteraction(interaction);
    };
    const detach = () => {
        if (interaction) {
            nativeView.removeInteraction(interaction);
            interaction = null;
            delegate = null;
        }
    };
    attach();
    view.on('loaded', attach);
    view.on('unloaded', detach);
    return () => {
        view.off('loaded', attach);
        view.off('unloaded', detach);
        detach();
    };
}
