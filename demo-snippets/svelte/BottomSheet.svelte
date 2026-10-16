<script lang="ts">
    import { Frame } from '@nativescript/core';
    import { showBottomSheet } from '@nativescript-community/ui-bottomsheet/svelte';
    import BottomSheetContent from './BottomSheetContent.svelte';
    let result = '';

    async function open(options = {}) {
        result = String(
            await showBottomSheet({
                view: BottomSheetContent,
                props: { title: 'Bottom sheet' },
                ...options
            })
        );
    }
</script>

<page>
    <actionBar title="Bottom sheet">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <uibutton text="default" on:tap={() => open()} />
            <uibutton text="peek height 150" on:tap={() => open({ peekHeight: 150 })} />
            <uibutton text="skip collapsed state" on:tap={() => open({ skipCollapsedState: true })} />
            <uibutton text="not dismissable by dragging or tapping outside" on:tap={() => open({ dismissOnDraggingDownSheet: false, dismissOnBackgroundTap: false })} />
            <uibutton text="touch behind allowed, no dimming" on:tap={() => open({ canTouchBehind: true, disableDimBackground: true })} />
            <uibutton text="transparent background" on:tap={() => open({ transparent: true })} />
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
