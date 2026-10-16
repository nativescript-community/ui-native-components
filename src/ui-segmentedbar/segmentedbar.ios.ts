import { createNativeFormattedText, renderAttributedStringToImage } from '@nativescript-community/ui-core/formatted-text';
import { SegmentedBar as CoreSegmentedBar } from '@nativescript/core';
import { itemsProperty, selectedIndexProperty } from '@nativescript/core/ui/segmented-bar/segmented-bar-common';
import { SegmentedBarItem } from './segmentedbar-common';

export { SegmentedBarItem };

/**
 * Puts the title or the icon of the item at its position in the control.
 */
function applyItem(control: UISegmentedControl, item: SegmentedBarItem, index: number, insert = false) {
    let title = item.title;
    // a template image: tinted by the selection state
    let image = item.image?.ios ? (item.image.ios as UIImage).imageWithRenderingMode(UIImageRenderingMode.AlwaysTemplate) : null;
    if (item.formattedText) {
        // the spans are drawn into an image: UISegmentedControl only shows plain titles
        const spansImage = renderAttributedStringToImage(createNativeFormattedText(item.formattedText, item.textOwner));
        if (spansImage) {
            image = spansImage;
            title = null;
        } else {
            title = item.formattedText.toString();
        }
    }
    if (title) {
        insert ? control.insertSegmentWithTitleAtIndexAnimated(title, index, false) : control.setTitleForSegmentAtIndex(title, index);
    } else if (image) {
        insert ? control.insertSegmentWithImageAtIndexAnimated(image, index, false) : control.setImageForSegmentAtIndex(image, index);
    } else if (insert) {
        control.insertSegmentWithTitleAtIndexAnimated('', index, false);
    }
}

export class SegmentedBar extends CoreSegmentedBar {
    items: SegmentedBarItem[];

    updateItem(item: SegmentedBarItem) {
        const index = this.items?.indexOf(item) ?? -1;
        if (this.ios && index >= 0) {
            applyItem(this.ios as UISegmentedControl, item, index);
        }
    }

    [itemsProperty.setNative](value: SegmentedBarItem[]) {
        const control = this.ios as UISegmentedControl;
        control.removeAllSegments();
        value?.forEach((item, index) => applyItem(control, item, index, true));
        selectedIndexProperty.coerce(this as any);
    }
}
