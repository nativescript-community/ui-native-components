<script lang="ts">
    import { closeBottomSheet } from '@nativescript-community/ui-bottomsheet/svelte';
    export let title = 'Bottom sheet';
    let count = 3;
</script>

<stackLayout class="sheet" backgroundColor="white">
    <label text={title} fontSize="20" fontWeight="bold" />
    <label text="UISheetPresentationController on iOS, BottomSheetDialogFragment on Android" textWrap="true" />
    {#each Array(count) as _, index}
        <label text={`item ${index + 1}`} padding="8" />
    {/each}
    <uibutton text="more content" variant="flat" on:tap={() => count++} />
    <uibutton text="close" on:tap={() => closeBottomSheet('closed from the button')} />
</stackLayout>

<style>
    .sheet {
        padding: 16;
    }
</style>
