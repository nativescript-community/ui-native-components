<style>
    .demo {
        padding: 12;
    }
    uibutton {
        margin-top: 6;
    }
</style>

<script lang="ts">
    import { onMount } from 'svelte';
    import { closeModal, showModal } from '@nativescript-community/svelte-native';
    import { action, alert, confirm } from '@nativescript-community/ui-dialogs';
    import { hideLoading, showLoading } from './loadingDialog';

    export let depth = 1;
    // scenarios: open with a loading dialog, close by itself after a delay
    export let loadingOnOpen = false;
    export let autoCloseAfter: number = null;
    export let hideLoadingOnClose = false;
    let result = '';

    async function show(fn: () => Promise<any>) {
        try {
            result = JSON.stringify(await fn());
        } catch (err) {
            result = 'error ' + err;
        }
    }
    async function closeAndHide() {
        closeModal(depth);
        if (hideLoadingOnClose) {
            // after the modal is being closed, like an app awaiting its work before hiding its loading dialog
            setTimeout(() => hideLoading());
        }
    }
    async function openModal() {
        const component = (await import('./DialogsStackedModal.svelte')).default;
        await showModal({ page: component, props: { depth: depth + 1 }, fullscreen: true, animated: true });
    }
    onMount(() => {
        // the modal is not presented yet when it is mounted
        const presented = 800;
        if (loadingOnOpen) {
            setTimeout(() => showLoading('Loading over a modal...'), presented);
        }
        if (autoCloseAfter) {
            setTimeout(closeAndHide, presented + autoCloseAfter);
        }
    });
</script>

<page>
    <scrollView>
        <stackLayout class="demo">
            <label text={`Modal ${depth}`} fontSize="22" fontWeight="bold" />
            <uibutton text="alert over this modal" on:tap={() => show(() => alert({ title: `Alert over modal ${depth}`, message: 'Close it, then use the modal again', okButtonText: 'OK' }))} />
            <uibutton text="confirm over this modal" on:tap={() => show(() => confirm({ title: `Confirm over modal ${depth}`, okButtonText: 'Yes', cancelButtonText: 'No' }))} />
            <uibutton text="action sheet over this modal" on:tap={() => show(() => action({ title: `Action sheet over modal ${depth}`, cancelButtonText: 'Cancel', actions: ['One', 'Two'] }))} />
            <uibutton text="show loading dialog (over this modal)" on:tap={() => showLoading(`Loading over modal ${depth}...`)} />
            <uibutton text="hide loading dialog (waits for this modal to close)" on:tap={() => hideLoading()} />
            <uibutton text="modal over this modal" on:tap={openModal} />
            <uibutton text="close this modal" on:tap={() => closeModal(depth)} />
            <uibutton
                text="close this modal + hide loading right after"
                on:tap={() => {
                    closeModal(depth);
                    setTimeout(() => hideLoading());
                }}
            />
            <label text={`result: ${result}`} textWrap="true" margin="12" />
        </stackLayout>
    </scrollView>
</page>
