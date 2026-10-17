/**
 * Progress component: core Progress augmented with `progressColor`, `progressBackgroundColor`, `indeterminate` and `busy`.
 * Android uses Material LinearProgressIndicator. iOS uses UIProgressView and swaps to a UIActivityIndicatorView when `indeterminate`.
 * @module @nativescript-community/ui-progress
 */

import { ProgressBase } from './index-common';
export * from './index-common';

export class Progress extends ProgressBase {}
