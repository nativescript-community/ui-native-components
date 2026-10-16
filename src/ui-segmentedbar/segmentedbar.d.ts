/**
 * SegmentedBar component: core SegmentedBar augmented with icon items (`src`, SF Symbols with `sys://`, font icons with `font://`).
 * Android uses MaterialButtonToggleGroup. iOS uses the native UISegmentedControl.
 * @module @nativescript-community/ui-segmentedbar
 */

import { FormattedString, ImageSource, SegmentedBar as CoreSegmentedBar, SegmentedBarItemBase } from '@nativescript/core';

export class SegmentedBarItem extends SegmentedBarItemBase {
    /**
     * Icon of the segment: file, resource, url, `sys://` (SF Symbol, iOS) or `font://` (font icon) path, or an ImageSource.
     * On iOS a segment shows either the title or the icon (the title wins).
     */
    src: string | ImageSource;
    /**
     * Rich text (spans) of the segment, it wins over the title.
     * `@nativescript-community/text` is used when installed (optional).
     * On iOS the spans are drawn into an image (UISegmentedControl only shows plain titles).
     */
    formattedText: FormattedString;
}

export class SegmentedBar extends CoreSegmentedBar {}
