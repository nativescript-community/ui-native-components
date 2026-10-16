// iOS uses the native UIActivityIndicatorView (from core). `indeterminate`, `value` and `maxValue` are no-op:
// UIKit has no determinate circular indicator.
import { ActivityIndicatorBase } from './index-common';
export * from './index-common';

export class ActivityIndicator extends ActivityIndicatorBase {}
