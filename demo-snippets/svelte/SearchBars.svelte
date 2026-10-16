<script lang="ts">
    import { Color, FormattedString, Frame, Span } from '@nativescript/core';
    function spans(...parts: { text: string; color?: string; bold?: boolean; size?: number }[]) {
        const formatted = new FormattedString();
        parts.forEach((part) => {
            const span = new Span();
            span.text = part.text;
            if (part.color) span.color = new Color(part.color);
            if (part.bold) span.fontWeight = 'bold';
            if (part.size) span.fontSize = part.size;
            formatted.spans.push(span);
        });
        return formatted;
    }
    const hintSpans = spans({ text: 'Search ', color: '#757575' }, { text: 'fruits', bold: true, color: '#d32f2f' });
    const contentSpans = spans({ text: 'Rich ', bold: true }, { text: 'content', color: '#6750a4' });
    let text = '';
    let submitted = '';
    const fruits = ['Apple', 'Apricot', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Lemon', 'Mango', 'Orange', 'Peach', 'Pear', 'Plum'];
    $: filtered = fruits.filter((f) => f.toLowerCase().includes(text.toLowerCase()));
</script>

<page>
    <actionBar title="Search bar">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <stackLayout class="demo">
        <label class="title" text="filled (default)" />
        <uisearchbar hint="Search fruits" {text} on:textChange={(e) => (text = e.value)} on:submit={() => (submitted = text)} on:clear={() => (text = '')} margin="8 12" />
        <label class="title" text="outline / minimal" />
        <uisearchbar variant="outline" hint="Outlined" margin="8 12" />
        <label class="title" text="rich text (hint and content spans)" />
        <uisearchbar formattedHint={hintSpans} margin="8 12" />
        <uisearchbar formattedHint={hintSpans} formattedText={contentSpans} margin="8 12" />
        <label text={`submitted: ${submitted}`} margin="4 16" />
        {#each filtered as fruit}
            <label text={fruit} padding="10 16" />
        {/each}
    </stackLayout>
</page>
