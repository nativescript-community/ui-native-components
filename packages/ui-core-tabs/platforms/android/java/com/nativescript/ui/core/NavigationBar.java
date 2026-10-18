package com.nativescript.ui.core;

import android.content.Context;
import android.content.res.ColorStateList;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.material.bottomnavigation.BottomNavigationView;
import com.google.android.material.navigation.NavigationBarView;

/**
 * Material 3 navigation bar (BottomNavigationView) driven by {@link TabItemSpec}s.
 * It exposes the same callbacks as the other tab bars: {@link #onTap(int)} and {@link #onSelectedPositionChange(int, int)}.
 * The item id of the menu is the position of the tab.
 */
public class NavigationBar extends BottomNavigationView {
    // Material navigation bars support 3 to 5 destinations
    private static final int MAX_ITEMS = 5;

    private TabItemSpec[] mItems = new TabItemSpec[0];
    private int mSelectedPosition = -1;
    private boolean mUpdating = false;

    public NavigationBar(Context context) {
        super(context);
        setLabelVisibilityMode(NavigationBarView.LABEL_VISIBILITY_LABELED);
        // the bar is laid out by NativeScript, inside the content: Material must not add the system bars insets as padding
        ViewCompat.setOnApplyWindowInsetsListener(this, new androidx.core.view.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsetsCompat onApplyWindowInsets(View v, WindowInsetsCompat insets) {
                return insets;
            }
        });
        setOnItemSelectedListener(new NavigationBarView.OnItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(MenuItem item) {
                if (mUpdating) {
                    return true;
                }
                int position = item.getItemId();
                if (!onTap(position)) {
                    return false;
                }
                int prevPosition = mSelectedPosition;
                mSelectedPosition = position;
                if (prevPosition != position) {
                    onSelectedPositionChange(position, prevPosition);
                }
                return true;
            }
        });
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // the NativeScript layouts can give no height: use the height of the Material 3 navigation bar
        int minHeight = getSuggestedMinimumHeight();
        if (minHeight <= 0) {
            minHeight = (int) (80 * getResources().getDisplayMetrics().density);
        }
        int mode = View.MeasureSpec.getMode(heightMeasureSpec);
        int size = View.MeasureSpec.getSize(heightMeasureSpec);
        int height = mode == View.MeasureSpec.EXACTLY ? Math.max(size, minHeight) : minHeight;
        super.onMeasure(widthMeasureSpec, View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY));
    }

    public void setItems(TabItemSpec[] items) {
        mItems = items != null ? items : new TabItemSpec[0];
        mUpdating = true;
        Menu menu = getMenu();
        menu.clear();
        int count = Math.min(mItems.length, MAX_ITEMS);
        for (int i = 0; i < count; i++) {
            MenuItem menuItem = menu.add(Menu.NONE, i, i, mItems[i].title);
            applySpec(menuItem, mItems[i]);
        }
        if (mSelectedPosition >= 0 && mSelectedPosition < count) {
            setSelectedItemId(mSelectedPosition);
        }
        mUpdating = false;
    }

    /**
     * Updates the title and the icon of an item
     */
    public void updateItemAt(int position, TabItemSpec spec) {
        if (position < 0 || position >= mItems.length) {
            return;
        }
        mItems[position] = spec;
        MenuItem menuItem = getMenu().findItem(position);
        if (menuItem != null) {
            applySpec(menuItem, spec);
        }
    }

    private void applySpec(MenuItem menuItem, TabItemSpec spec) {
        menuItem.setTitle(spec.formattedTitle != null ? spec.formattedTitle : spec.title);
        if (spec.iconDrawable != null) {
            menuItem.setIcon(spec.iconDrawable);
        } else if (spec.iconId != 0) {
            menuItem.setIcon(spec.iconId);
        } else {
            menuItem.setIcon(null);
        }
    }

    /**
     * Gets the view of the item at index
     */
    public View getViewForItemAt(int index) {
        return findViewById(index);
    }

    /**
     * Gets the label of the item at index
     */
    public TextView getTextViewForItemAt(int index) {
        return findTextView(getViewForItemAt(index));
    }

    private TextView findTextView(View view) {
        if (view instanceof TextView) {
            return (TextView) view;
        }
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) {
                TextView result = findTextView(group.getChildAt(i));
                if (result != null) {
                    return result;
                }
            }
        }
        return null;
    }

    public int getItemCount() {
        return Math.min(mItems.length, MAX_ITEMS);
    }

    public int getSelectedPosition() {
        return mSelectedPosition;
    }

    public void setSelectedPosition(int position) {
        if (position == mSelectedPosition) {
            return;
        }
        int prevPosition = mSelectedPosition;
        mSelectedPosition = position;
        onSelectedPositionChange(position, prevPosition);
        if (position >= 0 && position < getItemCount()) {
            mUpdating = true;
            setSelectedItemId(position);
            mUpdating = false;
        }
    }

    /**
     * Colors of the selected and unselected items (icons and labels). 0 keeps the theme color.
     */
    public void setItemColors(int selectedColor, int unselectedColor) {
        ColorStateList current = getItemTextColor();
        int defaultSelected = selectedColor;
        int defaultUnselected = unselectedColor;
        if (current != null) {
            if (defaultSelected == 0) {
                defaultSelected = current.getColorForState(new int[] { android.R.attr.state_checked }, current.getDefaultColor());
            }
            if (defaultUnselected == 0) {
                defaultUnselected = current.getDefaultColor();
            }
        }
        if (defaultSelected == 0 && defaultUnselected == 0) {
            return;
        }
        ColorStateList colors = new ColorStateList(new int[][] { { android.R.attr.state_checked }, {} }, new int[] { defaultSelected, defaultUnselected });
        setItemIconTintList(colors);
        setItemTextColor(colors);
    }

    public boolean onTap(int position) {
        // to be overridden in JS
        return true;
    }

    public void onSelectedPositionChange(int position, int prevPosition) {
        // to be overridden in JS
    }
}
