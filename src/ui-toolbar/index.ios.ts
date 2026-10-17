import { Color, Font, FormattedString, ImageSource, Utils, colorProperty } from '@nativescript/core';
import { renderFormattedTextToImageSource } from '@nativescript-community/ui-core/formatted-text';
import { ToolbarBase, ToolbarItem, centerTitleProperty, itemsProperty, navigationIconProperty, subtitleProperty, titleProperty } from './index-common';
export * from './index-common';

type Icon = string | ImageSource | FormattedString;

function toImage(icon: Icon, font?: Font): UIImage {
    if (!icon) {
        return null;
    }
    if (icon instanceof FormattedString) {
        return renderFormattedTextToImageSource(icon, undefined)?.ios;
    }
    if (icon instanceof ImageSource) {
        return icon.ios;
    }
    if (Utils.isFontIconURI(icon)) {
        // an icon font glyph, a template image tinted by the bar
        const image = ImageSource.fromFontIconCodeSync(icon.split('//')[1], (font || Font.default).withFontSize(24), new Color('black'))?.ios as UIImage;
        return image?.imageWithRenderingMode(UIImageRenderingMode.AlwaysTemplate);
    }
    if (icon.startsWith(Utils.SYSTEM_PREFIX)) {
        return UIImage.systemImageNamed(icon.slice(Utils.SYSTEM_PREFIX.length));
    }
    const source = icon.startsWith(Utils.RESOURCE_PREFIX) ? ImageSource.fromResourceSync(icon.slice(Utils.RESOURCE_PREFIX.length)) : ImageSource.fromFileSync(icon);
    return source?.ios;
}

/**
 * iOS: a UINavigationBar used as a view. On iOS 26 its bar buttons are in Liquid Glass capsules.
 * The `showAsAction: 'never'` actions are in a menu on a trailing `ellipsis` button.
 */
export class Toolbar extends ToolbarBase {
    nativeViewProtected: UINavigationBar;
    private mNavigationItem: UINavigationItem;

    public createNativeView() {
        const bar = UINavigationBar.alloc().init();
        const navigationItem = UINavigationItem.alloc().initWithTitle('');
        bar.items = NSArray.arrayWithArray([navigationItem] as any);
        this.mNavigationItem = navigationItem;
        return bar;
    }

    private action(title: string, image: UIImage, handler: () => void) {
        return UIAction.actionWithTitleImageIdentifierHandler(title, image, null, handler);
    }

    private updateItems() {
        const navigationItem = this.mNavigationItem;
        if (!navigationItem) {
            return;
        }
        const visible: ToolbarItem[] = [];
        const overflow: ToolbarItem[] = [];
        (this.items || []).forEach((item) => {
            (item.showAsAction === 'never' ? overflow : visible).push(item);
        });
        const buttons = visible.map((item) => {
            const image = toImage(item.iosIcon || item.icon, this.style.fontInternal);
            const button = UIBarButtonItem.alloc().initWithPrimaryAction(this.action(image ? '' : item.title || '', image, () => this.notifyItemTap(item)));
            button.enabled = !item.disabled;
            if (item.title) {
                button.accessibilityLabel = item.title;
            }
            return button;
        });
        if (overflow.length) {
            const children = overflow.map((item) => {
                const action = this.action(item.title || '', toImage(item.iosIcon || item.icon, this.style.fontInternal), () => this.notifyItemTap(item));
                if (item.disabled) {
                    action.attributes = UIMenuElementAttributes.Disabled;
                }
                return action;
            });
            buttons.push(UIBarButtonItem.alloc().initWithImageMenu(UIImage.systemImageNamed('ellipsis'), UIMenu.menuWithChildren(NSArray.arrayWithArray(children as any))));
        }
        // the first of the items is the closest to the trailing edge
        navigationItem.rightBarButtonItems = NSArray.arrayWithArray(buttons.reverse() as any);
    }

    [titleProperty.setNative](value: string) {
        this.mNavigationItem.title = value || null;
    }
    [subtitleProperty.setNative](value: string) {
        // iOS 26 UINavigationItem.subtitle
        (this.mNavigationItem as any).subtitle = value || null;
    }
    // the title of a UINavigationBar is always centered
    [centerTitleProperty.setNative](value: boolean) {}
    [navigationIconProperty.setNative](value: Icon) {
        const image = toImage(value, this.style.fontInternal);
        this.mNavigationItem.leftBarButtonItem = image ? UIBarButtonItem.alloc().initWithPrimaryAction(this.action('', image, () => this.notifyNavigationTap())) : null;
    }
    [itemsProperty.setNative](value: ToolbarItem[]) {
        this.updateItems();
    }
    [colorProperty.setNative](value: Color) {
        const color = value instanceof Color ? value.ios : value ? new Color(value as any).ios : null;
        this.nativeViewProtected.tintColor = color;
        const appearance = UINavigationBarAppearance.new();
        appearance.configureWithDefaultBackground();
        if (color) {
            appearance.titleTextAttributes = { [NSForegroundColorAttributeName]: color } as any;
        }
        this.nativeViewProtected.standardAppearance = appearance;
        this.nativeViewProtected.scrollEdgeAppearance = appearance;
    }
}
