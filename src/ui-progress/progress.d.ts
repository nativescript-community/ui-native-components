/**
 * Progress component: core Progress augmented with `progressColor`, `progressBackgroundColor`, `indeterminate` and `busy`.
 * Android uses Material LinearProgressIndicator. iOS uses UIProgressView and swaps to a UIActivityIndicatorView when `indeterminate`.
 * @module @nativescript-community/ui-progress
 */

import { ProgressBase } from './progress-common';
export * from './progress-common';

export class Progress extends ProgressBase {}
