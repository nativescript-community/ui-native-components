package com.nativescript.ui.core;

import android.graphics.drawable.Drawable;
import android.graphics.Typeface;

public class TabItemSpec {
    public String title;
    /** rich text (spans), wins over the title */
    public CharSequence formattedTitle;
    public int fontSize;
    public Typeface typeFace;
    public int iconId;
    public Drawable iconDrawable;
    public int imageHeight;
    public int backgroundColor;
    public int color;
}