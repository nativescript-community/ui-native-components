import { ContentView, CoreTypes, Utils } from '@nativescript/core';

/**
 * The system sizes the content view of the accessory: its layout drives the NativeScript layout of the child
 */
@NativeClass
class AccessoryHostView extends UIView {
    owner: WeakRef<BottomAccessory>;
    layoutSubviews() {
        super.layoutSubviews();
        const owner = this.owner?.get();
        if (owner) {
            owner.layoutInBounds(this.bounds.size.width, this.bounds.size.height);
        }
    }
}

export class BottomAccessory extends ContentView {
    public createNativeView() {
        const view = AccessoryHostView.new() as AccessoryHostView;
        view.owner = new WeakRef(this);
        return view;
    }

    layoutInBounds(width: number, height: number) {
        const pixelWidth = Utils.layout.toDevicePixels(width);
        const pixelHeight = Utils.layout.toDevicePixels(height);
        this.measure(Utils.layout.makeMeasureSpec(pixelWidth, Utils.layout.EXACTLY), Utils.layout.makeMeasureSpec(pixelHeight, Utils.layout.EXACTLY));
        this.layout(0, 0, pixelWidth, pixelHeight);
    }

    // the frame is the one given by the system
    public _setNativeViewFrame(nativeView: UIView, frame: CGRect) {}
}
