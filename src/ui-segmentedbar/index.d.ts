/**
 * SegmentedBar component: core SegmentedBar augmented with icon items (`src`, SF Symbols with `sys://`, font icons with `font://`).
 * Android uses MaterialButtonToggleGroup. iOS uses the native UISegmentedControl.
 * @module @nativescript-community/ui-segmentedbar
 */

import { FormattedString, ImageSource, SegmentedBar as CoreSegmentedBar, SegmentedBarItemBase } from '@nativescript/core';

export class SegmentedBarItem extends SegmentedBarItemBase {
    /**
     * Icon of the segment: file, resource, url, `sys://` (SF Symbol, iOS) or `font://` (font icon) path, an ImageSource, or a FormattedString (spans drawn into an icon).
     * On iOS a segment shows either the title or the icon (the title wins).
     */
    src: string | ImageSource | FormattedString;
    /**
     * Width of the segment in device independent pixels. A segment is as wide as its content when not set, and a stretched bar shares the extra width.
     * A text wider than the segment is truncated.
     * @default 0 (automatic)
     */
    width: number;
    /**
     * Rich text (spans) of the segment, it wins over the title.
     * `@nativescript-community/text` is used when installed (optional).
     * On iOS the spans are drawn into an image (UISegmentedControl only shows plain titles).
     */
    formattedText: FormattedString;
}

export class SegmentedBar extends CoreSegmentedBar {
    /**
     * Whether a segment is as wide as its content, or all the segments are as wide as the widest one.
     * An explicit `width` of the bar or of a segment changes the result: the extra width of the bar is shared between the segments.
     * @default true
     */
    apportionsSegmentWidthsByContent: boolean;
}
