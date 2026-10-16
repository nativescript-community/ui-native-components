import { Utils } from '@nativescript/core';
import { itemsProperty, selectedIndexProperty } from '@nativescript/core/ui/segmented-bar/segmented-bar-common';
import { SegmentedBarBase, SegmentedBarItem } from './segmentedbar-common';

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

    public createNativeView() {
        return new com.google.android.material.button.MaterialButtonToggleGroup(this._context);
    }

    public initNativeView(): void {
        super.initNativeView();
        const nativeView = this.nativeViewProtected;
        nativeView.setSingleSelection(true);
        nativeView.setSelectionRequired(true);
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
        const title = item.title;
        button.setText(title || '');
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
        }
    }

    private insertItem(item: SegmentedBarItem) {
        const R = (com.google.android.material as any).R;
        const button = new com.google.android.material.button.MaterialButton(this._context, null, R.attr.materialButtonOutlinedStyle);
        const height = Utils.layout.toDevicePixels(SEGMENT_HEIGHT);
        // no touch target insets
        button.setInsetTop(0);
        button.setInsetBottom(0);
        button.setMinHeight(height);
        button.setMinimumHeight(height);
        this.applyItem(button, item);
        // the segments share the width of the group
        this.nativeViewProtected.addView(button, new android.widget.LinearLayout.LayoutParams(0, height, 1));
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
