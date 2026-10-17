/**
 * FloatingActionButton component: core Button augmented with `src`, `size`, `expanded`, `show()` and `hide()`.
 * Android uses Material ExtendedFloatingActionButton. iOS uses a round native UIButton (Material only properties are no-op).
 * @module @nativescript-community/ui-floatingactionbutton
 */

import { FloatingActionButtonBase } from './index-common';
export * from './index-common';

export declare class FloatingActionButton extends FloatingActionButtonBase {
    show(): void;
    hide(): void;
}
