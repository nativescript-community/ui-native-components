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
    const hintSpans = spans({ text: 'Your ', color: '#757575' }, { text: 'name', bold: true, color: '#d32f2f' }, { text: ' here', size: 12, color: '#757575' });
    const contentSpans = spans({ text: 'Rich ', bold: true }, { text: 'content', color: '#6750a4' });
    let text = '';
    let error = '';
    $: error = text.length > 0 && text.length < 3 ? 'at least 3 characters' : '';
    let multiline = '';
    function setText(setter) {
        return (event) => setter(event.value);
    }
</script>

<page>
    <actionBar title="Text fields">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <label class="title" text="Material only visuals (floating label, helper, error, counter) are Android only, iOS uses the native fields" textWrap="true" />

            <label class="title" text="filled (default)" />
            <uitextfield hint="Name" helper="At least 3 characters" {error} counterMaxLength="12" maxLength="12" {text} on:textChange={(e) => (text = e.value)} />

            <label class="title" text="outline" />
            <uitextfield variant="outline" hint="Email" keyboardType="email" helper="we never share it" />

            <label class="title" text="underline / none" />
            <uitextfield variant="underline" hint="underline" />
            <uitextfield variant="none" hint="none" />

            <label class="title" text="digits, secure" />
            <uitextfield variant="outline" hint="only 0-9" digits="0123456789" keyboardType="number" />
            <uitextfield variant="outline" hint="password" secure="true" />

            <label class="title" text="rich text: hint spans (floating=false on Android) and content spans" textWrap="true" />
            <uitextfield variant="outline" floating="false" formattedHint={hintSpans} />
            <uitextfield variant="outline" floating="false" hint="plain" formattedText={contentSpans} />

            <label class="title" text="multiline" />
            <uitextview variant="outline" hint="Message" helper="multi line" counterMaxLength="100" maxLength="100" text={multiline} on:textChange={(e) => (multiline = e.value)} height="120" />
            <uitextview variant="filled" hint="filled" height="100" />
        </stackLayout>
    </scrollView>
</page>

<style>
    .demo {
        padding: 12;
    }
    .title {
        font-weight: bold;
        margin-top: 16;
        margin-bottom: 4;
    }
</style>
