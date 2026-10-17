import LiquidToasts
import SwiftUI
import UIKit

/// ObjC-visible facade over the Swift-only `LiquidToasts` package (https://github.com/SimplifyJobs/liquid-toasts),
/// used by `@nativescript-community/ui-snackbar` on iOS.
@objcMembers
@objc(NSCLiquidToast)
public class NSCLiquidToast: NSObject {
    private var handle: LiquidToastHandle?

    /// - Parameters:
    ///   - duration: seconds; `<= 0` keeps the toast until it is dismissed
    ///   - onDismiss: called once with the dismiss reason raw value (`timeout`, `manual`, `swipe`, `action`, `tap`, ...)
    public class func show(
        message: String,
        actionText: String?,
        duration: Double,
        textColor: UIColor?,
        backgroundColor: UIColor?,
        actionColor: UIColor?,
        maxLines: Int,
        onAction: (() -> Void)?,
        onDismiss: ((String) -> Void)?
    ) -> NSCLiquidToast {
        let result = NSCLiquidToast()
        MainActor.assumeIsolated {
            var style: ToastStyleModel? = nil
            if textColor != nil || backgroundColor != nil {
                var s = ToastStyleModel()
                if let textColor { s.foreground = toastColor(textColor) }
                if let backgroundColor { s.background = toastColor(backgroundColor) }
                style = s
            }
            var action: LiquidToastAction? = nil
            if let actionText, !actionText.isEmpty {
                action = LiquidToastAction(
                    label: actionText,
                    role: .primary,
                    color: actionColor.map { toastColor($0) }
                ) {
                    onAction?()
                }
            }
            let handle = LiquidToast.show(
                message,
                style: style,
                position: .bottomCenter,
                duration: duration > 0 ? .seconds(duration) : .persistent,
                action: action,
                maxLines: maxLines > 0 ? maxLines : nil
            )
            handle.onDismissed { reason in
                onDismiss?(reason.rawValue)
            }
            result.handle = handle
        }
        return result
    }

    public func dismiss() {
        MainActor.assumeIsolated {
            handle?.dismiss()
        }
    }

    @MainActor
    private class func toastColor(_ color: UIColor) -> ToastColor {
        let c = Color(uiColor: color)
        return ToastColor(light: c, dark: c)
    }
}
