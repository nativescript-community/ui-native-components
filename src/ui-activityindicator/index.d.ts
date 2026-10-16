/**
 * ActivityIndicator component: core ActivityIndicator augmented with `indeterminate`, `value` and `maxValue`.
 * Android uses Material progress. iOS uses the native UIActivityIndicatorView (`indeterminate`, `value` and `maxValue` are no-op).
 * @module @nativescript-community/ui-activityindicator
 */

import { ActivityIndicatorBase } from './index-common';
import { Progress as NSProgress } from '@nativescript/core';
import { mixin } from '@nativescript-community/ui-core';
export * from './index-common';

export class ActivityIndicator extends mixin(ActivityIndicatorBase, NSProgress) {}
