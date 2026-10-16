import { Color, ImageSource, Property, Utils } from '@nativescript/core';
import { SegmentedBarBase, SegmentedBarItemBase } from '@nativescript/core/ui/segmented-bar/segmented-bar-common';

export { SegmentedBarBase, SegmentedBarItemBase };

/**
 * Segment of the bar: a title and/or an icon.
 * `src` is a file, resource, url, `sys://` (SF Symbol, iOS) or `font://` (font icon, uses the font of the item) path, or an ImageSource.
 */
export class SegmentedBarItem extends SegmentedBarItemBase {
    src: string | ImageSource;
    /**
     * @internal loaded icon, always a white (template) image for the font icons
     */
    image: ImageSource;

    async loadImage(value: string | ImageSource) {
        let source: ImageSource;
        if (typeof value === 'string') {
            value = value.trim();
            if (Utils.isFontIconURI(value)) {
                source = ImageSource.fromFontIconCodeSync(value.split('//')[1], this.style.fontInternal, new Color('white'));
            } else if (value.indexOf(Utils.SYSTEM_PREFIX) === 0) {
                source = await ImageSource.fromSystemImage(value.slice(Utils.SYSTEM_PREFIX.length));
            } else if (Utils.isFileOrResourcePath(value)) {
                source = value.indexOf(Utils.RESOURCE_PREFIX) === 0 ? await ImageSource.fromResource(value.slice(Utils.RESOURCE_PREFIX.length)) : await ImageSource.fromFile(value);
            } else {
                source = await ImageSource.fromUrl(value);
            }
            if (this.src !== value) {
                // changed while loading
                return;
            }
        } else {
            source = value;
        }
        this.image = source;
        this._update();
    }

    _update() {
        (this.parent as any)?.updateItem?.(this);
    }
}

export const srcProperty = new Property<SegmentedBarItem, string | ImageSource>({
    name: 'src',
    valueChanged: (target, oldValue, newValue) => {
        if (newValue) {
            target.loadImage(newValue);
        } else {
            target.image = null;
            target._update();
        }
    }
});
srcProperty.register(SegmentedBarItem);
