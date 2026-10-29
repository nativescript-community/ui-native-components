import { Utils } from '@nativescript/core';
import { MenuItem, MenuPlacement, getSections } from './index-common';

/** colors of the menu: the ones of the Material theme, unless set with `setMenuColors` */
export interface MenuColors {
    /** the container of the menu */
    surface: string;
    /** a row */
    row: string;
    /** the row of a single choice which is selected */
    selected: string;
    onSelected: string;
    onSurface: string;
    onSurfaceVariant: string;
    /** the switch of a toggle which is on */
    accent: string;
    onAccent: string;
    outline: string;
    error: string;
}

let customColors: Partial<MenuColors>;

/** sets the colors of the menus (the app theme can differ from the Material theme of the activity) */
export function setMenuColors(colors: Partial<MenuColors>) {
    customColors = colors;
}

const THEME_ATTRIBUTES: Record<keyof MenuColors, [string, string]> = {
    surface: ['colorSurfaceContainer', '#ECEFF9'],
    row: ['colorSurfaceContainerLow', '#F5F7FF'],
    selected: ['colorPrimaryContainer', '#D8E2FF'],
    onSelected: ['colorOnPrimaryContainer', '#001A41'],
    onSurface: ['colorOnSurface', '#1A1B20'],
    onSurfaceVariant: ['colorOnSurfaceVariant', '#44474F'],
    accent: ['colorPrimary', '#475D92'],
    onAccent: ['colorOnPrimary', '#FFFFFF'],
    outline: ['colorOutline', '#74777F'],
    error: ['colorError', '#BA1A1A']
};

function resolveColors(context: android.content.Context): Record<keyof MenuColors, number> {
    const result = {} as Record<keyof MenuColors, number>;
    (Object.keys(THEME_ATTRIBUTES) as (keyof MenuColors)[]).forEach((key) => {
        const [attribute, fallback] = THEME_ATTRIBUTES[key];
        let color: string | number = customColors?.[key];
        if (color) {
            result[key] = android.graphics.Color.parseColor(color as string);
            return;
        }
        const identifier = context.getResources().getIdentifier(attribute, 'attr', context.getPackageName());
        result[key] =
            identifier > 0 ? com.google.android.material.color.MaterialColors.getColor(context, identifier, android.graphics.Color.parseColor(fallback)) : android.graphics.Color.parseColor(fallback);
    });
    return result;
}

const dp = (value: number) => Math.round(Utils.layout.toDevicePixels(value));

const OUTER_RADIUS = 20;
const INNER_RADIUS = 6;
const CONTAINER_RADIUS = 28;
const ROW_HEIGHT = 48;

function roundedDrawable(color: number, radii: number[], strokeColor?: number, strokeWidth?: number) {
    const drawable = new android.graphics.drawable.GradientDrawable();
    drawable.setColor(color);
    const values = Array.create('float', 8);
    for (let index = 0; index < 4; index++) {
        values[index * 2] = dp(radii[index]);
        values[index * 2 + 1] = dp(radii[index]);
    }
    drawable.setCornerRadii(values);
    if (strokeColor !== undefined) {
        drawable.setStroke(dp(strokeWidth), strokeColor);
    }
    return drawable;
}

function resourceDrawable(context: android.content.Context, name: string, color: number) {
    const identifier = context.getResources().getIdentifier(name, 'drawable', context.getPackageName());
    const drawable = androidx.appcompat.content.res.AppCompatResources.getDrawable(context, identifier).mutate();
    drawable.setTint(color);
    return drawable;
}

function withAlpha(color: number, alpha: number) {
    return android.graphics.Color.argb(Math.round(255 * alpha), android.graphics.Color.red(color), android.graphics.Color.green(color), android.graphics.Color.blue(color));
}

function createIcon(context: android.content.Context, drawable: android.graphics.drawable.Drawable, size: number) {
    const view = new android.widget.ImageView(context);
    view.setImageDrawable(drawable);
    view.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
    view.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp(size), dp(size)));
    return view;
}

/** a small switch: the state of a toggle item */
function createSwitch(context: android.content.Context, on: boolean, colors: Record<keyof MenuColors, number>) {
    const track = new android.widget.FrameLayout(context);
    track.setLayoutParams(new android.widget.LinearLayout.LayoutParams(dp(40), dp(24)));
    track.setBackground(on ? roundedDrawable(colors.accent, [12, 12, 12, 12]) : roundedDrawable(android.graphics.Color.TRANSPARENT, [12, 12, 12, 12], colors.outline, 2));
    const thumbSize = on ? 16 : 12;
    const thumb = new android.view.View(context);
    const params = new android.widget.FrameLayout.LayoutParams(dp(thumbSize), dp(thumbSize));
    params.gravity = (on ? android.view.Gravity.END : android.view.Gravity.START) | android.view.Gravity.CENTER_VERTICAL;
    params.setMargins(dp(on ? 0 : 6), 0, dp(on ? 4 : 0), 0);
    thumb.setLayoutParams(params);
    const thumbBackground = new android.graphics.drawable.GradientDrawable();
    thumbBackground.setShape(android.graphics.drawable.GradientDrawable.OVAL);
    thumbBackground.setColor(on ? colors.onAccent : colors.outline);
    thumb.setBackground(thumbBackground);
    track.addView(thumb);
    return track;
}

function createLabel(context: android.content.Context, text: string, color: number, first: boolean) {
    const label = new android.widget.TextView(context);
    label.setText(text);
    label.setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 12);
    label.setTextColor(color);
    label.setTypeface(android.graphics.Typeface.create('sans-serif-medium', android.graphics.Typeface.NORMAL));
    label.setPadding(dp(12), dp(first ? 8 : 12), dp(12), dp(6));
    return label;
}

interface RowOptions {
    item: MenuItem;
    /** index in the section and size of the section: the first and the last row have the big outer corners */
    position: number;
    count: number;
    colors: Record<keyof MenuColors, number>;
    onTap: () => void;
    /** icon name of the trailing element, instead of the state of the item (back row of a submenu) */
    leadingBack?: boolean;
}

function createRow(context: android.content.Context, { item, position, count, colors, onTap, leadingBack }: RowOptions, getIcon: (icon: MenuItem['icon']) => android.graphics.drawable.Drawable) {
    const selected = !!item.checked && !item.toggle;
    const first = position === 0;
    const last = position === count - 1;
    const radii = [first ? OUTER_RADIUS : INNER_RADIUS, first ? OUTER_RADIUS : INNER_RADIUS, last ? OUTER_RADIUS : INNER_RADIUS, last ? OUTER_RADIUS : INNER_RADIUS];
    const contentColor = item.destructive ? colors.error : selected ? colors.onSelected : colors.onSurface;

    const row = new android.widget.LinearLayout(context);
    row.setOrientation(android.widget.LinearLayout.HORIZONTAL);
    row.setGravity(android.view.Gravity.CENTER_VERTICAL);
    row.setMinimumHeight(dp(ROW_HEIGHT));
    row.setPadding(dp(16), 0, dp(16), 0);
    const background = roundedDrawable(selected ? colors.selected : colors.row, radii);
    const mask = roundedDrawable(android.graphics.Color.WHITE, radii);
    row.setBackground(new android.graphics.drawable.RippleDrawable(android.content.res.ColorStateList.valueOf(withAlpha(contentColor, 0.12)), background, mask));
    const params = new android.widget.LinearLayout.LayoutParams(android.view.ViewGroup.LayoutParams.MATCH_PARENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT);
    params.setMargins(0, 0, 0, last ? 0 : dp(2));
    row.setLayoutParams(params);

    if (leadingBack) {
        const back = createIcon(context, resourceDrawable(context, 'ns_menu_chevron', contentColor), 20);
        back.setRotation(180);
        (back.getLayoutParams() as android.widget.LinearLayout.LayoutParams).setMargins(0, 0, dp(12), 0);
        row.addView(back);
    } else {
        const icon = item.icon ? getIcon(item.icon) : null;
        if (icon) {
            if (typeof item.icon === 'string') {
                icon.mutate().setTint(contentColor);
            }
            const view = createIcon(context, icon, 20);
            (view.getLayoutParams() as android.widget.LinearLayout.LayoutParams).setMargins(0, 0, dp(12), 0);
            row.addView(view);
        }
    }

    const text = new android.widget.TextView(context);
    text.setTextSize(android.util.TypedValue.COMPLEX_UNIT_SP, 16);
    text.setTextColor(contentColor);
    text.setMaxLines(item.subtitle ? 2 : 1);
    text.setEllipsize(android.text.TextUtils.TruncateAt.END);
    const title = item.title || '';
    if (item.subtitle) {
        const spannable = new android.text.SpannableString(`${title}\n${item.subtitle}`);
        spannable.setSpan(new android.text.style.RelativeSizeSpan(0.8), title.length + 1, spannable.length(), 0);
        spannable.setSpan(new android.text.style.ForegroundColorSpan(colors.onSurfaceVariant), title.length + 1, spannable.length(), 0);
        text.setText(spannable as unknown as string);
    } else {
        text.setText(title);
    }
    text.setLayoutParams(new android.widget.LinearLayout.LayoutParams(0, android.view.ViewGroup.LayoutParams.WRAP_CONTENT, 1));
    row.addView(text);

    let trailing: android.view.View;
    if (item.items?.length) {
        trailing = createIcon(context, resourceDrawable(context, 'ns_menu_chevron', colors.onSurfaceVariant), 20);
    } else if (item.toggle) {
        trailing = createSwitch(context, !!item.checked, colors);
    } else if (selected) {
        trailing = createIcon(context, resourceDrawable(context, 'ns_menu_check', colors.onSelected), 20);
    }
    if (trailing) {
        (trailing.getLayoutParams() as android.widget.LinearLayout.LayoutParams).setMargins(dp(12), 0, 0, 0);
        row.addView(trailing);
    }

    if (item.disabled) {
        row.setAlpha(0.38);
    } else {
        row.setOnClickListener(new android.view.View.OnClickListener({ onClick: onTap }));
    }
    return row;
}

export interface PopupOptions {
    anchor: android.view.View;
    items: MenuItem[];
    placement?: MenuPlacement;
    getIcon: (icon: MenuItem['icon']) => android.graphics.drawable.Drawable;
    onSelect: (item: MenuItem) => void;
    onDismiss: () => void;
}

/**
 * A Material 3 Expressive menu: a 28dp container, each section is a segment of 48dp rows (20dp outer corners, 6dp inner ones, 2dp between rows) under a label.
 * A single choice is a tonal row with a trailing check, a toggle has a switch, a submenu replaces the content.
 */
export function showPopup({ anchor, items, placement, getIcon, onSelect, onDismiss }: PopupOptions) {
    const context = anchor.getContext();
    const colors = resolveColors(context);
    const screen = context.getResources().getDisplayMetrics();
    const margin = dp(8);

    const content = new android.widget.LinearLayout(context);
    content.setOrientation(android.widget.LinearLayout.VERTICAL);
    content.setPadding(dp(6), dp(6), dp(6), dp(6));
    const scroll = new android.widget.ScrollView(context);
    scroll.setVerticalScrollBarEnabled(false);
    scroll.setOverScrollMode(android.view.View.OVER_SCROLL_NEVER);
    scroll.addView(content);

    const popup = new android.widget.PopupWindow(scroll, android.view.ViewGroup.LayoutParams.WRAP_CONTENT, android.view.ViewGroup.LayoutParams.WRAP_CONTENT, true);
    const containerBackground = roundedDrawable(colors.surface, [CONTAINER_RADIUS, CONTAINER_RADIUS, CONTAINER_RADIUS, CONTAINER_RADIUS]);
    popup.setBackgroundDrawable(containerBackground);
    popup.setElevation(dp(6));
    popup.setOutsideTouchable(true);
    const horizontal = placement?.horizontal === 'end' ? 'end' : 'start';

    const maxWidth = Math.min(dp(280), screen.widthPixels - 2 * margin);
    let anchorLocation: number[];
    const place = () => {
        scroll.measure(
            android.view.View.MeasureSpec.makeMeasureSpec(maxWidth, android.view.View.MeasureSpec.AT_MOST),
            android.view.View.MeasureSpec.makeMeasureSpec(screen.heightPixels - 2 * margin, android.view.View.MeasureSpec.AT_MOST)
        );
        const width = Math.max(scroll.getMeasuredWidth(), dp(180));
        const fullHeight = scroll.getMeasuredHeight();
        const spaceBelow = screen.heightPixels - (anchorLocation[1] + anchor.getHeight()) - margin;
        const spaceAbove = anchorLocation[1] - margin;
        const above =
            placement?.vertical === 'above'
                ? fullHeight <= spaceAbove || spaceAbove > spaceBelow
                : placement?.vertical === 'below'
                  ? fullHeight > spaceBelow && spaceAbove > spaceBelow
                  : fullHeight > spaceBelow && spaceAbove > spaceBelow;
        const height = Math.min(fullHeight, above ? spaceAbove : spaceBelow);
        const x = Math.min(Math.max(margin, horizontal === 'end' ? anchorLocation[0] + anchor.getWidth() - width : anchorLocation[0]), screen.widthPixels - width - margin);
        const y = above ? anchorLocation[1] - height : anchorLocation[1] + anchor.getHeight();
        return { x, y, width, height, above };
    };

    const render = (entries: MenuItem[], parent?: { title: string; back: () => void }) => {
        content.removeAllViews();
        if (parent) {
            content.addView(createRow(context, { item: { title: parent.title }, position: 0, count: 1, colors, onTap: parent.back, leadingBack: true }, getIcon));
        }
        getSections(entries).forEach((section, index) => {
            if (section.title) {
                content.addView(createLabel(context, section.title, colors.onSurfaceVariant, index === 0 && !parent));
            } else if (index > 0 || parent) {
                const gap = new android.view.View(context);
                gap.setLayoutParams(new android.widget.LinearLayout.LayoutParams(1, dp(6)));
                content.addView(gap);
            }
            section.items.forEach((item, position) => {
                content.addView(
                    createRow(
                        context,
                        {
                            item,
                            position,
                            count: section.items.length,
                            colors,
                            onTap: () => {
                                if (item.items?.length) {
                                    render(item.items, { title: item.title, back: () => render(entries, parent) });
                                    return;
                                }
                                onSelect(item);
                                popup.dismiss();
                            }
                        },
                        getIcon
                    )
                );
            });
        });
    };
    render(items);

    anchorLocation = Array.create('int', 2) as any;
    anchor.getLocationOnScreen(anchorLocation as any);
    const { x, y, width, height, above } = place();
    popup.setWidth(width);
    popup.setHeight(height);
    const resources = context.getResources();
    const animation = resources.getIdentifier(`NSMenuAnimation_${horizontal}_${above ? 'above' : 'below'}`, 'style', context.getPackageName());
    if (animation > 0) {
        popup.setAnimationStyle(animation);
    }
    popup.setOnDismissListener(new android.widget.PopupWindow.OnDismissListener({ onDismiss }));
    popup.showAtLocation(anchor.getRootView(), android.view.Gravity.NO_GRAVITY, x, y);
}
