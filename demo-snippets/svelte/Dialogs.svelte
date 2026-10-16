<script lang="ts">
    import { Frame, Label, StackLayout } from '@nativescript/core';
    import { action, alert, confirm, login, prompt, AlertDialog } from '@nativescript-community/ui-dialogs';
    let result = '';

    async function show(fn: () => Promise<any>) {
        try {
            result = JSON.stringify(await fn());
        } catch (err) {
            result = 'error ' + err;
        }
        console.log('dialog result', result);
    }
    function customView() {
        const stack = new StackLayout();
        stack.padding = 12;
        const label = new Label();
        label.text = 'A custom view inside the dialog';
        label.textWrap = true;
        stack.addChild(label);
        return stack;
    }
</script>

<page>
    <actionBar title="Dialogs">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <label text="UIAlertController on iOS, Material dialogs on Android" textWrap="true" />
            <uibutton text="alert" on:tap={() => show(() => alert({ title: 'Alert', message: 'A simple alert', okButtonText: 'OK' }))} />
            <uibutton text="confirm" on:tap={() => show(() => confirm({ title: 'Confirm', message: 'Are you sure?', okButtonText: 'Yes', cancelButtonText: 'No' }))} />
            <uibutton text="prompt" on:tap={() => show(() => prompt({ title: 'Prompt', message: 'Your name', hintText: 'name', okButtonText: 'OK', cancelButtonText: 'Cancel', autoFocus: true }))} />
            <uibutton text="login" on:tap={() => show(() => login({ title: 'Login', message: 'Enter your credentials', userNameHint: 'user', passwordHint: 'password', okButtonText: 'Login', cancelButtonText: 'Cancel' }))} />
            <uibutton text="action (action sheet on iOS)" on:tap={() => show(() => action({ title: 'Choose', message: 'An action', cancelButtonText: 'Cancel', actions: ['One', 'Two', 'Three'] }))} />
            <uibutton text="custom view" on:tap={() => show(() => alert({ title: 'Custom view', view: customView(), okButtonText: 'Close' }))} />
            <uibutton text="validated (shouldResolveOnAction)" on:tap={() => show(() => prompt({ title: 'Validated', message: 'Type "ok" to validate', okButtonText: 'OK', cancelButtonText: 'Cancel', shouldResolveOnAction: (r) => !r.result || r.text === 'ok' }))} />
            <label text={`result: ${result}`} textWrap="true" margin="12" />
        </stackLayout>
    </scrollView>
</page>

<style>
    .demo {
        padding: 12;
    }
    uibutton {
        margin-top: 6;
    }
</style>
