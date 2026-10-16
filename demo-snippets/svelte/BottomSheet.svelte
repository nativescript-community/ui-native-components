<script lang="ts">
    import { Frame } from '@nativescript/core';
    import { showBottomSheet } from '@nativescript-community/ui-bottomsheet/svelte';
    import BottomSheetContent from './BottomSheetContent.svelte';
    import BottomSheetList from './BottomSheetList.svelte';
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
            <uibutton text="detents: content, large" on:tap={() => open({ detents: ['content', 'large'], onDetentChange: (i) => (result = `detent ${i}`) })} />
            <uibutton text="detents: 150, medium, large (starts at medium)" on:tap={() => open({ detents: [150, 'medium', 'large'], initialDetentIndex: 1, onDetentChange: (i) => (result = `detent ${i}`) })} />
            <uibutton text="fraction 0.3 + 0.7, no grabber, radius 40" on:tap={() => open({ detents: [{ fraction: 0.3 }, { fraction: 0.7 }], grabber: false, cornerRadius: 40 })} />
            <uibutton text="list (collectionview): medium, large" on:tap={() => open({ view: BottomSheetList, detents: ['medium', 'large'], onDetentChange: (i) => (result = `detent ${i}`) })} />
            <uibutton text="undimmed at the first detent (150, large)" on:tap={() => open({ detents: [150, 'large'], largestUndimmedDetentIndex: 0, onDetentChange: (i) => (result = `detent ${i}`) })} />
            <uibutton text="asks before dismissing (onWillDismiss)" on:tap={() => open({ onWillDismiss: () => { result = 'will dismiss: prevented'; return false; }, onDismissAttempt: () => (result += ' / attempt') })} />
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
