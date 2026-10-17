import { renderFormattedTextToImageSource } from '@nativescript-community/ui-core/formatted-text';
import { Color, FormattedString, ImageSource, Label, Property, Span, Utils } from '@nativescript/core';
import { SegmentedBarBase, SegmentedBarItemBase } from '@nativescript/core/ui/segmented-bar/segmented-bar-common';

export { SegmentedBarBase, SegmentedBarItemBase };

/**
 * Segment of the bar: a title and/or an icon.
 * `src` is a file, resource, url, `sys://` (SF Symbol, iOS) or `font://` (font icon, uses the font of the item) path, or an ImageSource.
 */
export class SegmentedBarItem extends SegmentedBarItemBase {
    src: string | ImageSource | FormattedString;
    /**
     * @internal true for the icons drawn from spans: they keep their colors
     */
    imageIsOriginal = false;
    /**
     * @internal loaded icon, always a white (template) image for the font icons
     */
    image: ImageSource;

    private mLabel: Label;
    /**
     * Label used to create the native rich text (spans) of the item and as the owner of the formattedText.
     * @internal
     */
    get textOwner(): Label {
        if (!this.mLabel) {
            this.mLabel = new Label();
        }
        return this.mLabel;
    }

    /**
     * Rich text (spans) of the segment, it wins over the title.
     * Uses `@nativescript-community/text` when it is installed.
     * On iOS the text is drawn as an image (the native control only shows plain titles), so the colors are the ones of the spans.
     */
    get formattedText(): FormattedString {
        return this.mLabel?.formattedText;
    }
    set formattedText(value: FormattedString) {
        this.textOwner.formattedText = value;
        this._update();
    }

    _addChildFromBuilder(name: string, value: any) {
        if (value instanceof Span) {
            if (!this.formattedText) {
                this.formattedText = new FormattedString();
            }
            this.formattedText.spans.push(value);
            this._update();
        } else if (value instanceof FormattedString) {
            this.formattedText = value;
        }
    }

    async loadImage(value: string | ImageSource | FormattedString) {
        let source: ImageSource;
        this.imageIsOriginal = false;
        if (value instanceof FormattedString) {
            // an icon drawn from spans (font icons, emojis...)
            source = renderFormattedTextToImageSource(value, this.textOwner);
            this.imageIsOriginal = true;
        } else if (typeof value === 'string') {
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

export const srcProperty = new Property<SegmentedBarItem, string | ImageSource | FormattedString>({
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
