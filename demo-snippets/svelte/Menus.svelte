<script lang="ts">
    import { Color, FormattedString, Frame, Span } from '@nativescript/core';
    import { showMenu, setContextMenu } from '@nativescript-community/ui-menu';
    import { onMount } from 'svelte';

    // an icon drawn from spans (here an emoji, a font icon works the same)
    const heart = new FormattedString();
    const heartSpan = new Span();
    heartSpan.text = '♥';
    heartSpan.color = new Color('#d32f2f');
    heart.spans.push(heartSpan);

    let result = '';
    let compact = true;
    let horizontal = 'start';
    let vertical = 'below';
    let longPressLabel;

    function items() {
        return [
            { id: 'copy', title: 'Copy', subtitle: 'to the clipboard', icon: __IOS__ ? 'sys://doc.on.doc' : 'res://ic_add' },
            { id: 'star', title: 'Starred', icon: __IOS__ ? 'sys://star' : 'res://ic_star', checked: compact },
            {
                title: 'Share as',
                icon: __IOS__ ? 'sys://square.and.arrow.up' : undefined,
                items: [{ id: 'link', title: 'Link' }, { id: 'file', title: 'File', disabled: true }]
            },
            { separator: true },
            { id: 'love', title: 'Love it', icon: heart },
            { id: 'delete', title: 'Delete', icon: __IOS__ ? 'sys://trash' : undefined, destructive: true }
        ];
    }

    async function onTap(e) {
        const item = await showMenu({ anchor: e.object, items: items(), placement: { horizontal, vertical } });
        if (item) {
            if (item.id === 'star') {
                compact = !compact;
            }
            result = `selected ${item.id}`;
        } else {
            result = 'dismissed';
        }
    }

    function onLabelLoaded(e) {
        longPressLabel = e.object;
        setContextMenu(longPressLabel, { items, onSelect: (item) => (result = `context: ${item.id}`) });
    }
</script>

<page>
    <actionBar title="Menus">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <stackLayout class="demo">
        <label class="title" text="menu attached to a button" />
        <uibutton text="show menu" marginTop="300" width="160" horizontalAlignment="center" on:tap={onTap} />
        <label class="title" text={`placement: ${horizontal} / ${vertical} (tap to change)`} on:tap={() => { horizontal = horizontal === 'start' ? 'center' : horizontal === 'center' ? 'end' : 'start'; }} />
        <label class="title" text="vertical: below / above (tap)" on:tap={() => (vertical = vertical === 'below' ? 'above' : 'below')} />
        <label class="title" text="long press the label for a context menu" />
        <label text="long press me" class="h2" on:loaded={onLabelLoaded} />
        <label class="title" text={result} />
    </stackLayout>
</page>
