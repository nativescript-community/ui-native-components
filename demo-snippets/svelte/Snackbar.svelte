<script lang="ts">
    import { Frame } from '@nativescript/core';
    import { SnackBar } from '@nativescript-community/ui-snackbar';
    const snackbar = new SnackBar();
    let result = '';

    async function show(fn: () => Promise<any>) {
        result = JSON.stringify(await fn());
    }
</script>

<page>
    <actionBar title="Snackbar">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <label text="The snackbar is a Material component: Android only, nothing is shown on iOS" textWrap="true" />
            <uibutton text="simple" on:tap={() => show(() => snackbar.simple('A simple snackbar'))} />
            <uibutton text="with action" on:tap={() => show(() => snackbar.action({ message: 'Message deleted', actionText: 'UNDO', hideDelay: 5000 }))} />
            <uibutton text="custom colors" on:tap={() => show(() => snackbar.showSnack({ message: 'Colors', textColor: 'white', backgroundColor: '#6750a4', actionText: 'OK', actionTextColor: '#ffd8e4' }))} />
            <label text={`result: ${result}`} margin="12" textWrap="true" />
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
