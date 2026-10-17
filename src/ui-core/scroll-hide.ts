import { View } from '@nativescript/core';

/**
 * Calls `onChange('down')` when the content of the scrolling `target` (collectionview, scrollview, listview...) scrolls down and `onChange('up')` when it scrolls up.
 * Used to hide a floating action button or a bottom bar while the user reads, and show it when he scrolls back.
 * @param threshold distance (dip) the content must move in a direction before the change is reported
 * @returns a function to stop observing
 */
export function observeScrollDirection(target: View, onChange: (direction: 'up' | 'down') => void, threshold = 12): () => void {
    let last: number;
    let accumulated = 0;
    let direction: 'up' | 'down';
    const listener = (args: any) => {
        const offset: number = args.scrollOffset ?? args.scrollY ?? args.object?.verticalOffset;
        if (typeof offset !== 'number' || isNaN(offset)) {
            return;
        }
        if (last === undefined) {
            last = offset;
            return;
        }
        const delta = offset - last;
        last = offset;
        if (offset <= 0) {
            // top of the content: always shown
            accumulated = 0;
            if (direction !== 'up') {
                direction = 'up';
                onChange('up');
            }
            return;
        }
        // same direction: accumulate, else restart
        accumulated = Math.sign(accumulated) === Math.sign(delta) ? accumulated + delta : delta;
        const next = accumulated > threshold ? 'down' : accumulated < -threshold ? 'up' : direction;
        if (next && next !== direction) {
            direction = next;
            onChange(next);
        }
    };
    target.on('scroll', listener);
    return () => target.off('scroll', listener);
}
