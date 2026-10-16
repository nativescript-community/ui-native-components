<script lang="ts">
    import { Template } from '@nativescript-community/svelte-native/components';
    import { Frame } from '@nativescript/core';

    let chat = false;
    let topRefreshing = false;
    let bottomRefreshing = false;
    let counter = 0;
    const make = (n: number, prefix: string) => Array.from({ length: n }, () => ({ text: `${prefix} ${++counter}` }));

    // a chat is newest first (reverseLayout): the top of the screen is the oldest messages
    let items = make(14, 'message');
    let log = '';

    function reset(value: boolean) {
        chat = value;
        counter = 0;
        items = make(14, 'message');
        log = '';
    }

    // the top of the screen: older messages in a chat, newer items in a list
    function onTopRefresh() {
        topRefreshing = true;
        log = 'top refresh';
        setTimeout(() => {
            items = chat ? [...items, ...make(8, 'older')] : [...make(3, 'new'), ...items];
            topRefreshing = false;
        }, 1500);
    }

    // the bottom of the screen: newer messages in a chat, more items in a list
    function onBottomRefresh() {
        bottomRefreshing = true;
        log = 'bottom refresh';
        setTimeout(() => {
            items = chat ? [...make(3, 'newer'), ...items] : [...items, ...make(8, 'more')];
            bottomRefreshing = false;
        }, 1500);
    }
</script>

<page>
    <actionBar title="Pull to refresh">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <gridLayout rows="auto,auto,*">
        <stackLayout orientation="horizontal" padding="8">
            <uibutton text="list" variant={chat ? 'flat' : 'contained'} on:tap={() => reset(false)} />
            <uibutton text="chat (reverseLayout)" variant={chat ? 'contained' : 'flat'} on:tap={() => reset(true)} />
        </stackLayout>
        <label row="1" text={`${log} (${items.length} items)`} padding="8" />
        {#key chat}
            <uipulltorefresh row="2" topEnabled="true" bottomEnabled="true" refreshing={topRefreshing} bottomRefreshing={bottomRefreshing} on:refresh={onTopRefresh} on:bottomRefresh={onBottomRefresh}>
                <collectionview {items} reverseLayout={chat} rowHeight="56">
                    <Template let:item>
                        <label text={item.text} padding="0 16" verticalAlignment="center" backgroundColor={chat ? '#e8def8' : 'transparent'} margin="4 16" borderRadius="12" />
                    </Template>
                </collectionview>
            </uipulltorefresh>
        {/key}
    </gridLayout>
</page>
