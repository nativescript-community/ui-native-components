import { createNativeFormattedText } from '@nativescript-community/ui-core/formatted-text';
import { Utils } from '@nativescript/core';
import { itemsProperty, selectedIndexProperty } from '@nativescript/core/ui/segmented-bar/segmented-bar-common';
import { SegmentedBarBase, SegmentedBarItem, apportionsSegmentWidthsByContentProperty } from './index-common';

export { SegmentedBarItem };

type ToggleGroup = com.google.android.material.button.MaterialButtonToggleGroup & { listener: com.google.android.material.button.MaterialButtonToggleGroup.OnButtonCheckedListener };

// Material 3 segmented buttons are 40dp high
const SEGMENT_HEIGHT = 40;

/**
 * Android: Material 3 segmented buttons (MaterialButtonToggleGroup with outlined buttons).
 */
export class SegmentedBar extends SegmentedBarBase {
    declare nativeViewProtected: ToggleGroup;
    items: SegmentedBarItem[];
    apportionsSegmentWidthsByContent: boolean;

    public createNativeView() {
        return new com.google.android.material.button.MaterialButtonToggleGroup(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        nativeView.setSingleSelection(true);
        nativeView.setSelectionRequired(true);
        // the segments keep the same height whatever their text
        nativeView.setBaselineAligned(false);
        const owner = new WeakRef(this);
        const listener = new com.google.android.material.button.MaterialButtonToggleGroup.OnButtonCheckedListener({
            onButtonChecked(group, checkedId, isChecked) {
                const _owner = owner.get();
                if (_owner && isChecked) {
                    const newIndex = group.indexOfChild(group.findViewById(checkedId));
                    if (newIndex !== _owner.selectedIndex) {
                        _owner.selectedIndex = newIndex;
                    }
                }
            }
        });
        nativeView.addOnButtonCheckedListener(listener);
        nativeView.listener = listener;
    }

    public disposeNativeView() {
        const nativeView = this.nativeViewProtected;
        if (nativeView?.listener) {
            nativeView.removeOnButtonCheckedListener(nativeView.listener);
            nativeView.listener = null;
        }
        super.disposeNativeView();
    }

    private applyItem(button: com.google.android.material.button.MaterialButton, item: SegmentedBarItem) {
        const formatted = item.formattedText;
        if (formatted && !item.textOwner.fontSize) {
            // spans without size: the size of the Material button text
            item.textOwner.fontSize = 14;
        }
        const title = formatted ? formatted.toString() : item.title;
        button.setText(formatted ? createNativeFormattedText(formatted, item.textOwner) || title : title || '');
        const image = item.image?.android as android.graphics.Bitmap;
        if (image) {
            button.setIcon(new android.graphics.drawable.BitmapDrawable(Utils.android.getApplicationContext().getResources(), image));
            button.setIconGravity(com.google.android.material.button.MaterialButton.ICON_GRAVITY_TEXT_START);
            button.setIconPadding(title ? Utils.layout.toDevicePixels(8) : 0);
        } else {
            button.setIcon(null);
        }
    }

    updateItem(item: SegmentedBarItem) {
        const index = this.items?.indexOf(item) ?? -1;
        const button = index >= 0 ? (this.nativeViewProtected?.getChildAt(index) as com.google.android.material.button.MaterialButton) : null;
        if (button) {
            this.applyItem(button, item);
            button.setLayoutParams(this.createLayoutParams(item));
        }
    }

    private createLayoutParams(item: SegmentedBarItem) {
        const height = Utils.layout.toDevicePixels(SEGMENT_HEIGHT);
        if (item.width > 0) {
            return new android.widget.LinearLayout.LayoutParams(Utils.layout.toDevicePixels(item.width), height);
        }
        // by content a segment is never narrower than its text, otherwise all the segments get an equal share.
        // The weight shares the extra width of a stretched group
        const width = this.apportionsSegmentWidthsByContent ? android.view.ViewGroup.LayoutParams.WRAP_CONTENT : 0;
        return new android.widget.LinearLayout.LayoutParams(width, height, 1);
    }

    [apportionsSegmentWidthsByContentProperty.setNative](value: boolean) {
        const nativeView = this.nativeViewProtected;
        // equal segments are as wide as the widest, like UISegmentedControl
        nativeView.setMeasureWithLargestChildEnabled(!value);
        this.items?.forEach((item, index) => nativeView.getChildAt(index)?.setLayoutParams(this.createLayoutParams(item)));
    }

    private insertItem(item: SegmentedBarItem) {
        // the R classes are not in the metadata of the apps: the attribute is found by name
        const style = this._context.getResources().getIdentifier('materialButtonOutlinedStyle', 'attr', this._context.getPackageName());
        const button = new com.google.android.material.button.MaterialButton(this._context, null, style);
        const height = Utils.layout.toDevicePixels(SEGMENT_HEIGHT);
        // no touch target insets
        button.setInsetTop(0);
        button.setInsetBottom(0);
        button.setMinHeight(height);
        button.setMinimumHeight(height);
        this.applyItem(button, item);
        this.nativeViewProtected.addView(button, this.createLayoutParams(item));
    }

    [selectedIndexProperty.getDefault](): number {
        return -1;
    }
    [selectedIndexProperty.setNative](value: number) {
        const button = value >= 0 ? this.nativeViewProtected.getChildAt(value) : null;
        if (button) {
            this.nativeViewProtected.check(button.getId());
        } else {
            this.nativeViewProtected.clearChecked();
        }
    }

    [itemsProperty.getDefault](): SegmentedBarItem[] {
        return null;
    }
    [itemsProperty.setNative](value: SegmentedBarItem[]) {
        this.nativeViewProtected.removeAllViews();
        value?.forEach((item) => this.insertItem(item));
        selectedIndexProperty.coerce(this);
    }
}
