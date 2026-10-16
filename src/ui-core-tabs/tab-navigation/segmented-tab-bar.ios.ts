/**
 * Native strip of the top tabs on iOS: a UISegmentedControl (the HIG recommends it to switch between the views of a screen,
 * tab views do not exist on iOS). It exposes the small API that the tabs implementation needs: items, selection, colors and fonts.
 * A segment shows the title of its UITabBarItem, or its image when it has no title (the HIG does not recommend to mix both).
 */

const HORIZONTAL_PADDING = 12;
const VERTICAL_PADDING = 8;
const BAR_HEIGHT = 32 + 2 * VERTICAL_PADDING;

export interface SegmentedTabBarDelegate {
    tabBarViewShouldSelectItem(tabBar: SegmentedTabBar, item: UITabBarItem): boolean;
    tabBarViewDidSelectItem(tabBar: SegmentedTabBar, item: UITabBarItem): void;
}

@NativeClass
class SegmentedTarget extends NSObject {
    _owner: WeakRef<SegmentedTabBar>;
    static initWithOwner(owner: SegmentedTabBar) {
        const target = SegmentedTarget.new() as SegmentedTarget;
        target._owner = new WeakRef(owner);
        return target;
    }
    valueChanged(sender: UISegmentedControl) {
        this._owner.get()?._onValueChanged();
    }
    static ObjCExposedMethods = {
        valueChanged: { returns: interop.types.void, params: [UISegmentedControl] }
    };
}

@NativeClass
export class SegmentedTabBar extends UIView {
    control: UISegmentedControl;
    tabBarDelegate: SegmentedTabBarDelegate;
    // no initializers: the field initializers are not run for an instance created from native, see setup()
    private mItems: UITabBarItem[];
    private mSelectedIndex: number;
    private mTarget: SegmentedTarget;
    private mTitleAttributes: { [state: number]: { [key: string]: any } };

    public static create() {
        const bar = SegmentedTabBar.alloc().init() as SegmentedTabBar;
        bar.setup();
        return bar;
    }

    private setup() {
        this.mItems = [];
        this.mSelectedIndex = -1;
        this.mTitleAttributes = {};
        const control = (this.control = UISegmentedControl.alloc().initWithItems(null));
        this.mTarget = SegmentedTarget.initWithOwner(this);
        control.addTargetActionForControlEvents(this.mTarget, 'valueChanged', UIControlEvents.ValueChanged);
        this.addSubview(control);
    }

    _onValueChanged() {
        const index = this.control.selectedSegmentIndex;
        const item = this.mItems[index];
        if (!item) {
            return;
        }
        if (this.tabBarDelegate && !this.tabBarDelegate.tabBarViewShouldSelectItem(this, item)) {
            // refused: back to the previous segment
            this.control.selectedSegmentIndex = this.mSelectedIndex;
            return;
        }
        this.mSelectedIndex = index;
        this.tabBarDelegate?.tabBarViewDidSelectItem(this, item);
    }

    layoutSubviews() {
        super.layoutSubviews();
        const size = this.bounds.size;
        this.control.frame = CGRectMake(HORIZONTAL_PADDING, VERTICAL_PADDING, Math.max(0, size.width - 2 * HORIZONTAL_PADDING), Math.max(0, size.height - 2 * VERTICAL_PADDING));
    }

    sizeThatFits(size: CGSize): CGSize {
        return CGSizeMake(size.width, BAR_HEIGHT);
    }

    sizeToFit() {
        const superview = this.superview;
        this.frame = CGRectMake(this.frame.origin.x, this.frame.origin.y, superview ? superview.bounds.size.width : this.frame.size.width, BAR_HEIGHT);
    }

    get items(): NSArray<UITabBarItem> {
        return NSArray.arrayWithArray(this.mItems as any);
    }

    set items(value: NSArray<UITabBarItem>) {
        const items: UITabBarItem[] = [];
        for (let i = 0; value && i < value.count; i++) {
            items.push(value.objectAtIndex(i));
        }
        this.mItems = items;
        const control = this.control;
        control.removeAllSegments();
        items.forEach((item, index) => {
            if (item.title) {
                control.insertSegmentWithTitleAtIndexAnimated(item.title, index, false);
            } else if (item.image) {
                control.insertSegmentWithImageAtIndexAnimated(item.image, index, false);
            } else {
                control.insertSegmentWithTitleAtIndexAnimated('', index, false);
            }
        });
        this.mSelectedIndex = -1;
        control.selectedSegmentIndex = -1;
    }

    get selectedItem(): UITabBarItem {
        return this.mItems[this.mSelectedIndex];
    }

    setSelectedItemAnimated(item: UITabBarItem, animated: boolean) {
        const index = this.mItems.indexOf(item);
        this.mSelectedIndex = index;
        this.control.selectedSegmentIndex = index;
    }

    get barTintColor(): UIColor {
        return this.backgroundColor;
    }
    set barTintColor(value: UIColor) {
        this.backgroundColor = value;
    }

    /**
     * Color of the selected segment
     */
    get selectionIndicatorStrokeColor(): UIColor {
        return this.control.selectedSegmentTintColor;
    }
    set selectionIndicatorStrokeColor(value: UIColor) {
        this.control.selectedSegmentTintColor = value;
    }

    // not used by a segmented control
    selectionIndicatorTemplate: any;
    rippleColor: UIColor;

    private applyTitleAttributes(state: UIControlState) {
        this.control.setTitleTextAttributesForState((this.mTitleAttributes[state] || {}) as any, state);
    }

    setTitleColorForState(color: UIColor, state: UIControlState) {
        const attributes = (this.mTitleAttributes[state] = this.mTitleAttributes[state] || {});
        if (color) {
            attributes[NSForegroundColorAttributeName] = color;
        } else {
            delete attributes[NSForegroundColorAttributeName];
        }
        this.applyTitleAttributes(state);
    }

    setTitleFontForState(font: UIFont, state: UIControlState) {
        const attributes = (this.mTitleAttributes[state] = this.mTitleAttributes[state] || {});
        if (font) {
            attributes[NSFontAttributeName] = font;
        } else {
            delete attributes[NSFontAttributeName];
        }
        this.applyTitleAttributes(state);
    }

    titleFontForState(state: UIControlState): UIFont {
        return this.mTitleAttributes[state]?.[NSFontAttributeName] || UIFont.systemFontOfSize(UIFont.labelFontSize);
    }

    titleColorForState(state: UIControlState): UIColor {
        return this.mTitleAttributes[state]?.[NSForegroundColorAttributeName] || UIColor.labelColor;
    }

    setImageTintColorForState(color: UIColor, state: UIControlState) {
        // the images of the segments are tinted by the tint color of the control
        if (state === UIControlState.Selected && color) {
            this.control.tintColor = color;
        }
    }
}
