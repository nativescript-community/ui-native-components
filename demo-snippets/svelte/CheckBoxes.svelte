<script lang="ts">
    import { Frame } from '@nativescript/core';
    let items = [
        { name: 'Apples', checked: true },
        { name: 'Bananas', checked: false },
        { name: 'Cherries', checked: true }
    ];
    $: all = items.every((i) => i.checked);
    $: none = items.every((i) => !i.checked);
    $: indeterminate = !all && !none;

    function toggleAll(checked: boolean) {
        items = items.map((i) => ({ ...i, checked }));
    }
    let agree = false;
</script>

<page>
    <actionBar title="Checkbox">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <stackLayout class="demo" padding="16">
        <label class="title" text="indeterminate parent" />
        <uicheckbox text="Select all" checked={all} {indeterminate} on:checkedChange={(e) => toggleAll(e.value)} />
        {#each items as item, i}
            <uicheckbox text={item.name} checked={item.checked} marginLeft="32" on:checkedChange={(e) => (items[i].checked = e.value)} />
        {/each}
        <label class="title" text="custom color and font" />
        <uicheckbox text="I agree to the terms" checkedColor="#d32f2f" fontSize="18" checked={agree} on:checkedChange={(e) => (agree = e.value)} />
        <label text={`agree: ${agree}`} />
        <uicheckbox text="disabled" isEnabled="false" checked="true" />
    </stackLayout>
</page>
