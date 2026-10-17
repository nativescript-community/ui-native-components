<script lang="ts">
    import { Color, FormattedString, Frame, Span } from '@nativescript/core';
    // an icon drawn from spans: a colored glyph
    const heart = new FormattedString();
    const heartSpan = new Span();
    heartSpan.text = '♥';
    heartSpan.color = new Color('#d32f2f');
    heart.spans.push(heartSpan);
    let log = '';
    const icon = (ios: string, android: string) => (__IOS__ ? `sys://${ios}` : `res://${android}`);
    const items = [
        { id: 'search', title: 'Search', icon: icon('magnifyingglass', 'ic_add') },
        { id: 'star', title: 'Favorite', icon: icon('star', 'ic_star') },
        { id: 'font', title: 'Font icon', icon: 'font://★' },
        { id: 'heart', title: 'Spans icon', icon: heart },
        { id: 'settings', title: 'Settings', showAsAction: 'never' },
        { id: 'help', title: 'Help', showAsAction: 'never' }
    ];
</script>

<page actionBarHidden="true">
    <gridLayout rows="auto,*">
        <uitoolbar title="Inbox" subtitle="3 unread" navigationIcon={icon('chevron.left', 'ic_star')} {items} on:navigationTap={() => Frame.topmost().goBack()} on:itemTap={(e) => (log = `tapped: ${e.item.id}`)} />
        <stackLayout row="1" padding="16">
            <label text="Toolbar: Material 3 MaterialToolbar on Android, a UINavigationBar (glass bar buttons on iOS 26) on iOS" textWrap="true" />
            <label text={log} class="title" />
            <label text="colored" marginTop="16" />
        </stackLayout>
    </gridLayout>
</page>
