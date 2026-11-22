import { Label, StackLayout } from '@nativescript/core';
import { AlertDialog } from '@nativescript-community/ui-dialogs';

// a single dialog shown and hidden again, like an app loading indicator
let dialog: AlertDialog;
let showing = false;

export function showLoading(text = 'Loading...') {
    if (!dialog) {
        const stack = new StackLayout();
        stack.padding = 20;
        stack.backgroundColor = 'transparent';
        const label = new Label();
        label.text = text;
        stack.addChild(label);
        dialog = new AlertDialog({ view: stack, cancelable: false });
    }
    showing = true;
    // shown again while a modal covers it: the dialog must be visible over the modal
    dialog.show();
}

export async function hideLoading() {
    if (dialog && showing) {
        showing = false;
        await dialog.hide();
    }
}
