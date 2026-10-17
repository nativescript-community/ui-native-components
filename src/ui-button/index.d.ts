/**
 * Button component: core Button augmented with `variant`, `role`, `src`/`imageSource`, `isLoading` and Material properties.
 * Android uses MaterialButton. iOS uses the native UIButton (Material only properties are no-op).
 * @module @nativescript-community/ui-button
 */

import { ButtonBase } from './index-common';
export * from './index-common';

export class Button extends ButtonBase {}
