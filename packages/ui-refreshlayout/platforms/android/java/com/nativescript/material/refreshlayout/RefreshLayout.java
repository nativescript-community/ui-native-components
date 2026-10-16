package com.nativescript.material.refreshlayout;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ShapeDrawable;
import android.graphics.drawable.shapes.OvalShape;
import android.util.TypedValue;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.animation.DecelerateInterpolator;

import androidx.core.view.ViewCompat;
import androidx.swiperefreshlayout.widget.CircularProgressDrawable;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

/**
 * SwipeRefreshLayout (pull from the top) which also supports a pull from the bottom.
 * A horizontal drag is not intercepted, so a horizontal carousel can be inside (same as the CarouselFriendlySwipeRefreshLayout of the former ui-refreshlayout).
 * Both follow the nested scrolling of the child (RecyclerView/CollectionView, NestedScrollView...): the top is the visual top, whatever the layout direction of the child.
 */
public class RefreshLayout extends SwipeRefreshLayout {
    private static final float DRAG_RATE = 0.5f;
    private static final int SPINNER_SIZE_DP = 40;
    private static final int TRIGGER_DP = 80;
    private static final int MAX_PULL_DP = 160;

    private boolean mTopEnabled = true;
    private boolean mBottomEnabled = false;
    private boolean mBottomRefreshing = false;
    private float mBottomPull = 0;
    private final int mTrigger;
    private final int mMaxPull;
    private final int mSpinnerSize;
    private View mTarget;
    private ValueAnimator mAnimator;

    private final CircularProgressDrawable mSpinner;
    private final ShapeDrawable mSpinnerBackground;
    private Runnable mBottomRefreshListener;
    private final float mTouchSlop;
    private float mPreviousX;

    public RefreshLayout(Context context) {
        super(context);
        mTouchSlop = ViewConfiguration.get(context).getScaledTouchSlop();
        float density = context.getResources().getDisplayMetrics().density;
        mTrigger = (int) (TRIGGER_DP * density);
        mMaxPull = (int) (MAX_PULL_DP * density);
        mSpinnerSize = (int) (SPINNER_SIZE_DP * density);
        mSpinner = new CircularProgressDrawable(context);
        mSpinner.setStyle(CircularProgressDrawable.DEFAULT);
        mSpinnerBackground = new ShapeDrawable(new OvalShape());
        TypedValue value = new TypedValue();
        int background = context.getTheme().resolveAttribute(com.google.android.material.R.attr.colorSurfaceContainerHigh, value, true) ? value.data : Color.WHITE;
        mSpinnerBackground.getPaint().setColor(background);
        int primary = context.getTheme().resolveAttribute(androidx.appcompat.R.attr.colorPrimary, value, true) ? value.data : Color.BLACK;
        mSpinner.setColorSchemeColors(primary);
        setColorSchemeColors(primary);
        setProgressBackgroundColorSchemeColor(background);
        getOverlay().add(mSpinnerBackground);
        getOverlay().add(mSpinner);
        mSpinnerBackground.setAlpha(0);
        mSpinner.setAlpha(0);
    }

    // ---- configuration

    public void setTopEnabled(boolean enabled) {
        mTopEnabled = enabled;
        setEnabled(enabled);
    }

    public void setBottomEnabled(boolean enabled) {
        mBottomEnabled = enabled;
        if (!enabled && (mBottomPull > 0 || mBottomRefreshing)) {
            setBottomRefreshing(false);
        }
    }

    public boolean isBottomRefreshing() {
        return mBottomRefreshing;
    }

    public void setBottomRefreshListener(Runnable listener) {
        mBottomRefreshListener = listener;
    }

    public void setIndicatorColor(int color) {
        mSpinner.setColorSchemeColors(color);
        setColorSchemeColors(color);
    }

    public void setIndicatorBackgroundColor(int color) {
        mSpinnerBackground.getPaint().setColor(color);
        setProgressBackgroundColorSchemeColor(color);
        invalidate();
    }

    // ---- bottom refresh state

    public void setBottomRefreshing(boolean refreshing) {
        if (refreshing == mBottomRefreshing) {
            return;
        }
        mBottomRefreshing = refreshing;
        if (refreshing) {
            // programmatic start: the spinner at its resting position
            animatePullTo(mTrigger, false);
            startSpinner();
        } else {
            mSpinner.stop();
            animatePullTo(0, true);
        }
    }

    private void startSpinner() {
        mSpinner.setAlpha(255);
        mSpinnerBackground.setAlpha(255);
        mSpinner.setStartEndTrim(0f, 0.8f);
        mSpinner.start();
    }

    private View getTarget() {
        if (mTarget == null) {
            for (int i = 0; i < getChildCount(); i++) {
                View child = getChildAt(i);
                // the circle of the SwipeRefreshLayout is a CircleImageView (an ImageView)
                if (!(child instanceof android.widget.ImageView) && child.getVisibility() != GONE) {
                    mTarget = child;
                    break;
                }
            }
        }
        return mTarget;
    }

    @Override
    public void onViewRemoved(View child) {
        super.onViewRemoved(child);
        if (child == mTarget) {
            mTarget = null;
        }
    }

    private void applyPull(float pull) {
        mBottomPull = pull;
        View target = getTarget();
        if (target != null) {
            target.setTranslationY(-pull);
        }
        positionSpinner(pull);
    }

    private void positionSpinner(float pull) {
        int width = getWidth();
        int height = getHeight();
        float progress = Math.min(1f, pull / mTrigger);
        // centered in the space freed at the bottom
        int centerY = (int) (height - pull / 2f);
        int left = (width - mSpinnerSize) / 2;
        int top = centerY - mSpinnerSize / 2;
        mSpinnerBackground.setBounds(left, top, left + mSpinnerSize, top + mSpinnerSize);
        int inset = mSpinnerSize / 5;
        mSpinner.setBounds(left + inset, top + inset, left + mSpinnerSize - inset, top + mSpinnerSize - inset);
        if (!mBottomRefreshing) {
            int alpha = (int) (255 * Math.min(1f, progress * 1.5f));
            mSpinnerBackground.setAlpha(alpha);
            mSpinner.setAlpha(alpha);
            mSpinner.setStartEndTrim(0f, 0.8f * progress);
            mSpinner.setProgressRotation(progress * 0.5f);
            mSpinner.setArrowEnabled(progress > 0.1f);
            mSpinner.setArrowScale(progress);
        }
        invalidate();
    }

    private void animatePullTo(float to, final boolean hideSpinner) {
        if (mAnimator != null) {
            mAnimator.cancel();
        }
        mAnimator = ValueAnimator.ofFloat(mBottomPull, to);
        mAnimator.setDuration(250);
        mAnimator.setInterpolator(new DecelerateInterpolator());
        mAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator animation) {
                applyPull((Float) animation.getAnimatedValue());
            }
        });
        if (hideSpinner) {
            mAnimator.addListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mSpinner.setAlpha(0);
                    mSpinnerBackground.setAlpha(0);
                    invalidate();
                }
            });
        }
        mAnimator.start();
    }

    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        if (mBottomPull > 0) {
            positionSpinner(mBottomPull);
        }
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent event) {
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                mPreviousX = event.getX();
                break;
            case MotionEvent.ACTION_MOVE:
                if (Math.abs(event.getX() - mPreviousX) > mTouchSlop) {
                    return false;
                }
                break;
        }
        return super.onInterceptTouchEvent(event);
    }

    // ---- nested scrolling

    @Override
    public boolean onStartNestedScroll(View child, View target, int axes, int type) {
        boolean top = mTopEnabled && super.onStartNestedScroll(child, target, axes, type);
        return top || (mBottomEnabled && (axes & ViewCompat.SCROLL_AXIS_VERTICAL) != 0 && type == ViewCompat.TYPE_TOUCH);
    }

    @Override
    public void onNestedPreScroll(View target, int dx, int dy, int[] consumed, int type) {
        if (mTopEnabled) {
            super.onNestedPreScroll(target, dx, dy, consumed, type);
        }
        // moving the finger back down releases the bottom pull
        if (mBottomPull > 0 && !mBottomRefreshing && dy < 0 && type == ViewCompat.TYPE_TOUCH) {
            float release = Math.min(mBottomPull, -dy / DRAG_RATE);
            applyPull(mBottomPull - release);
            consumed[1] += (int) (-release * DRAG_RATE);
        }
    }

    @Override
    public void onNestedScroll(View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed, int type, int[] consumed) {
        if (mTopEnabled) {
            super.onNestedScroll(target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, type, consumed);
        }
        if (mBottomEnabled && !mBottomRefreshing && type == ViewCompat.TYPE_TOUCH && dyUnconsumed > 0 && !target.canScrollVertically(1)) {
            if (mAnimator != null) {
                mAnimator.cancel();
            }
            applyPull(Math.min(mMaxPull, mBottomPull + dyUnconsumed * DRAG_RATE));
            // the overscroll effect of the child (stretch/glow) must not take it
            consumed[1] += dyUnconsumed;
        }
    }

    @Override
    public void onStopNestedScroll(View target, int type) {
        if (mTopEnabled) {
            super.onStopNestedScroll(target, type);
        }
        if (mBottomPull > 0 && !mBottomRefreshing && type == ViewCompat.TYPE_TOUCH) {
            if (mBottomPull >= mTrigger) {
                mBottomRefreshing = true;
                animatePullTo(mTrigger, false);
                startSpinner();
                if (mBottomRefreshListener != null) {
                    mBottomRefreshListener.run();
                }
            } else {
                animatePullTo(0, true);
            }
        }
    }
}
