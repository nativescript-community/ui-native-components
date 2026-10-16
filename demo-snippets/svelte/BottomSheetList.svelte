<script lang="ts">
    import { Template } from '@nativescript-community/svelte-native/components';
    import { closeBottomSheet } from '@nativescript-community/ui-bottomsheet/svelte';
    const items = Array.from({ length: 60 }, (_, i) => ({ title: `row ${i + 1}` }));
</script>

<gridLayout rows="auto,*">
    <label text="CollectionView in a sheet" fontSize="20" fontWeight="bold" padding="16" />
    <collectionview row="1" {items} rowHeight="48">
        <Template let:item>
            <label text={item.title} padding="0 16" verticalAlignment="center" />
        </Template>
    </collectionview>
</gridLayout>
