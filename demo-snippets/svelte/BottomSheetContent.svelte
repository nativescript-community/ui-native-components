<script lang="ts">
    import { closeBottomSheet } from '@nativescript-community/ui-bottomsheet/svelte';
    export let title = 'Bottom sheet';
    let count = 3;
    let sheet;
</script>

<stackLayout class="sheet" backgroundColor="white" on:loaded={(e) => (sheet = e.object)}>
    <label text={title} fontSize="20" fontWeight="bold" />
    <label text="UISheetPresentationController on iOS, BottomSheetDialogFragment on Android" textWrap="true" />
    {#each Array(count) as _, index}
        <label text={`item ${index + 1}`} padding="8" />
    {/each}
    <uibutton text="more content" variant="flat" on:tap={() => count++} />
    <stackLayout orientation="horizontal">
        <uibutton text="detent 0" variant="flat" on:tap={() => sheet.setBottomSheetDetentIndex(0)} />
        <uibutton text="detent 1" variant="flat" on:tap={() => sheet.setBottomSheetDetentIndex(1)} />
        <uibutton text="detent 2" variant="flat" on:tap={() => sheet.setBottomSheetDetentIndex(2)} />
    </stackLayout>
    <uibutton text="close" on:tap={() => closeBottomSheet('closed from the button')} />
</stackLayout>

<style>
    .sheet {
        padding: 16;
    }
</style>
