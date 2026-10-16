import { FormattedString, ImageSource, TextBase } from '@nativescript/core';
import { createNativeFormattedTextCommon } from './formatted-text-common';

export function createNativeFormattedText(formatted: FormattedString, owner?: TextBase): NSAttributedString {
    return createNativeFormattedTextCommon(formatted, owner);
}

export function renderAttributedStringToImage(attributed: NSAttributedString): UIImage {
    if (!attributed || attributed.length === 0) {
        return null;
    }
    // the text without color uses the label color
    const mutable = NSMutableAttributedString.alloc().initWithAttributedString(attributed);
    const labelColor = UIColor.labelColor.resolvedColorWithTraitCollection(UITraitCollection.currentTraitCollection);
    mutable.enumerateAttributeInRangeOptionsUsingBlock(NSForegroundColorAttributeName, { location: 0, length: mutable.length }, 0 as NSAttributedStringEnumerationOptions, (value, range) => {
        if (!value) {
            mutable.addAttributeValueRange(NSForegroundColorAttributeName, labelColor, range);
        }
    });
    const bounds = mutable.boundingRectWithSizeOptionsContext(CGSizeMake(10000, 10000), NSStringDrawingOptions.UsesLineFragmentOrigin, null);
    const size = CGSizeMake(Math.ceil(bounds.size.width), Math.ceil(bounds.size.height));
    const renderer = UIGraphicsImageRenderer.alloc().initWithSize(size);
    const image = renderer.imageWithActions(() => {
        mutable.drawInRect(CGRectMake(0, 0, size.width, size.height));
    });
    return image.imageWithRenderingMode(UIImageRenderingMode.AlwaysOriginal);
}

export function renderFormattedTextToImageSource(formatted: FormattedString, owner: TextBase, fontSize = 24): ImageSource {
    if (!formatted) {
        return null;
    }
    if (owner && !owner.style.fontSize) {
        owner.style.fontSize = fontSize;
    }
    const image = renderAttributedStringToImage(createNativeFormattedText(formatted, owner));
    return image ? new ImageSource(image) : null;
}
