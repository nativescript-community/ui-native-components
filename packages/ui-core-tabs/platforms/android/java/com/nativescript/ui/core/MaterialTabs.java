package com.nativescript.ui.core;

import android.content.Context;
import android.content.res.ColorStateList;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.tabs.TabLayout;

/**
 * Material 3 tab layout driven by {@link TabItemSpec}s and synchronized with a ViewPager2.
 * It exposes the same callbacks as the other tab bars: {@link #onTap(int)} and {@link #onSelectedPositionChange(int, int)}.
 */
public class MaterialTabs extends TabLayout {
    // fixed tabs share the width, more tabs scroll
    private static final int MAX_FIXED_ITEMS = 4;

    private TabItemSpec[] mItems = new TabItemSpec[0];
    private int mSelectedPosition = -1;
    private boolean mUpdating = false;
    private ViewPager2 mViewPager;
    private ViewPager2.OnPageChangeCallback mPageCallback;

    public MaterialTabs(Context context) {
        super(context);
        addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                if (mUpdating) {
                    return;
                }
                int position = tab.getPosition();
                if (!onTap(position)) {
                    // refused: back to the previous tab
                    selectQuietly(mSelectedPosition);
                    return;
                }
                int prevPosition = mSelectedPosition;
                mSelectedPosition = position;
                if (prevPosition != position) {
                    onSelectedPositionChange(position, prevPosition);
                }
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {
            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {
            }
        });
    }

    private void selectQuietly(int position) {
        if (position < 0 || position >= getTabCount()) {
            return;
        }
        mUpdating = true;
        selectTab(getTabAt(position));
        mUpdating = false;
    }

    /**
     * Moves the indicator while the pager is scrolled
     */
    public void setViewPager(ViewPager2 viewPager) {
        if (mViewPager != null && mPageCallback != null) {
            mViewPager.unregisterOnPageChangeCallback(mPageCallback);
        }
        mViewPager = viewPager;
        if (viewPager == null) {
            return;
        }
        mPageCallback = new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
                if (position >= 0 && position < getTabCount() - (positionOffset > 0 ? 1 : 0)) {
                    setScrollPosition(position, positionOffset, false);
                }
            }
        };
        viewPager.registerOnPageChangeCallback(mPageCallback);
    }

    public void setItems(TabItemSpec[] items) {
        mItems = items != null ? items : new TabItemSpec[0];
        mUpdating = true;
        removeAllTabs();
        for (int i = 0; i < mItems.length; i++) {
            TabLayout.Tab tab = newTab();
            applySpec(tab, mItems[i]);
            addTab(tab, false);
        }
        setTabMode(mItems.length > MAX_FIXED_ITEMS ? TabLayout.MODE_SCROLLABLE : TabLayout.MODE_FIXED);
        mUpdating = false;
        if (mSelectedPosition >= 0) {
            selectQuietly(mSelectedPosition);
        }
    }

    private void applySpec(TabLayout.Tab tab, TabItemSpec spec) {
        tab.setText(spec.formattedTitle != null ? spec.formattedTitle : spec.title);
        if (spec.iconDrawable != null) {
            tab.setIcon(spec.iconDrawable);
        } else if (spec.iconId != 0) {
            tab.setIcon(spec.iconId);
        } else {
            tab.setIcon(null);
        }
    }

    public void updateItemAt(int position, TabItemSpec spec) {
        if (position < 0 || position >= mItems.length) {
            return;
        }
        mItems[position] = spec;
        TabLayout.Tab tab = getTabAt(position);
        if (tab != null) {
            applySpec(tab, spec);
        }
    }

    public View getViewForItemAt(int index) {
        TabLayout.Tab tab = getTabAt(index);
        return tab != null ? tab.view : null;
    }

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
        return getTabCount();
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
        selectQuietly(position);
    }

    public void forceTransitionToPosition(int position) {
        setScrollPosition(position, 0f, true);
        selectQuietly(position);
    }

    public void scrollToTab(int position) {
        if (position >= 0 && position < getTabCount()) {
            setScrollPosition(position, 0f, true);
        }
    }

    public void setSelectedIndicatorColors(int... colors) {
        if (colors != null && colors.length > 0) {
            setSelectedTabIndicatorColor(colors[0]);
        }
    }

    /**
     * Colors of the selected and unselected tabs (icons and labels). 0 keeps the theme color.
     */
    public void setItemColors(int selectedColor, int unselectedColor) {
        if (selectedColor == 0 && unselectedColor == 0) {
            // keep the Material 3 theme colors
            return;
        }
        ColorStateList current = getTabTextColors();
        int selected = selectedColor;
        int unselected = unselectedColor;
        if (current != null) {
            if (selected == 0) {
                selected = current.getColorForState(new int[] { android.R.attr.state_selected }, current.getDefaultColor());
            }
            if (unselected == 0) {
                unselected = current.getDefaultColor();
            }
        }
        if (selected == 0 && unselected == 0) {
            return;
        }
        setTabTextColors(unselected, selected);
        setTabIconTint(new ColorStateList(new int[][] { { android.R.attr.state_selected }, {} }, new int[] { selected, unselected }));
    }

    public boolean onTap(int position) {
        // to be overridden in JS
        return true;
    }

    public void onSelectedPositionChange(int position, int prevPosition) {
        // to be overridden in JS
    }
}
