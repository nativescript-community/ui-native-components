<style>
    .demo {
        padding: 12;
    }
    uibutton {
        margin-top: 6;
    }
</style>

<script lang="ts">
    import { Frame } from '@nativescript/core';
    import { showModal } from '@nativescript-community/svelte-native';
    import { hideLoading, showLoading } from './loadingDialog';
    import DialogsStackedModal from './DialogsStackedModal.svelte';

    // a modal can not be presented while the dialog is still being presented
    const dialogPresented = () => new Promise((resolve) => setTimeout(resolve, 800));

    // 1. what an app does while processing a captured image: a loading dialog stays up under a modal, then the modal is closed
    async function loadingThenModal() {
        showLoading('Loading under a modal...');
        await dialogPresented();
        await showModal({ page: DialogsStackedModal, props: { depth: 1 }, fullscreen: true, animated: true });
        // the dialog is shown again over the page, then hidden
        setTimeout(() => hideLoading(), 3000);
    }
    // 2. same, the modal closes by itself and the loading dialog is hidden right after (no wait)
    async function loadingThenModalAutoClose() {
        showLoading('Loading under a modal...');
        await dialogPresented();
        await showModal({ page: DialogsStackedModal, props: { depth: 1, autoCloseAfter: 1500, hideLoadingOnClose: true }, fullscreen: true, animated: true });
    }
    // 3. a modal showing a loading dialog over itself, then closed with the dialog still up (the crash this page was made for)
    async function modalWithLoadingAutoClose() {
        await showModal({ page: DialogsStackedModal, props: { depth: 1, loadingOnOpen: true, autoCloseAfter: 1500, hideLoadingOnClose: true }, fullscreen: true, animated: true });
    }
    // 4. same, closed without hiding the loading dialog: it stays over the page until hidden
    async function modalWithLoadingAutoCloseKeep() {
        await showModal({ page: DialogsStackedModal, props: { depth: 1, loadingOnOpen: true, autoCloseAfter: 1500 }, fullscreen: true, animated: true });
        // the dialog blocks the page: it is hidden by code
        setTimeout(() => hideLoading(), 3000);
    }
</script>

<page>
    <actionBar title="Dialogs stacked with modals">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <label text="Each case must end with no crash, no empty or misplaced dialog, and no dialog left on screen once hidden." textWrap="true" />
            <label
                text="1. loading dialog, modal over it, close the modal by hand. In the modal, stack more: alert, loading, modal over modal... then close them in any order. The loading dialog is hidden 3 s after the last modal is closed."
                textWrap="true"
                margin="12 0 0 0"
            />
            <uibutton text="loading -> modal (manual)" on:tap={loadingThenModal} />
            <label text="2. loading dialog, modal over it closes by itself after 1.5 s, loading hidden right after." textWrap="true" margin="12 0 0 0" />
            <uibutton text="loading -> modal -> close + hide" on:tap={loadingThenModalAutoClose} />
            <label text="3. modal shows a loading dialog, then closes with it still up and hides it right after." textWrap="true" margin="12 0 0 0" />
            <uibutton text="modal -> loading -> close + hide" on:tap={modalWithLoadingAutoClose} />
            <label text="4. same, the loading dialog stays up over the page for 3 s after the modal is closed, then it is hidden." textWrap="true" margin="12 0 0 0" />
            <uibutton text="modal -> loading -> close, hide 3 s later" on:tap={modalWithLoadingAutoCloseKeep} />
        </stackLayout>
    </scrollView>
</page>
