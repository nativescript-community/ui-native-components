<script lang="ts">
    import { Frame, FormattedString, Span, Color } from '@nativescript/core';
    import { onMount } from 'svelte';
    import { Template } from '@nativescript-community/svelte-native/components';
    import { GestureHandlerStateEvent, GestureState, HandlerType, Manager } from '@nativescript-community/gesturehandler';
    import type { AppBarScrollBehavior, AppBarSize } from '@nativescript-community/ui-appbar';

    const all = Array.from({ length: 80 }, (_, i) => ({ title: `row ${i + 1}` }));
    let query = '';
    $: items = all.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()));
    const icon = (ios: string, android: string) => (__IOS__ ? `sys://${ios}` : `res://${android}`);
    const menu = [
        { title: 'Share', icon: icon('square.and.arrow.up', 'ic_star'), onSelect: () => (log = 'menu: share') },
        { title: 'Favorite', checked: true, onSelect: () => (log = 'menu: favorite') },
        { separator: true },
        { title: 'Delete', destructive: true, icon: icon('trash', 'ic_add'), onSelect: () => (log = 'menu: delete') }
    ];
    let size: AppBarSize = 'large';
    let behavior: AppBarScrollBehavior = 'lift';
    let translucent = false;
    let spans = false;
    let bar;
    let list;
    let fab;
    // the bar follows the scrolling list (iOS: large title collapse)
    onMount(() => {
        bar.nativeView.scrollTarget = list.nativeView;
        // the button hides when the list scrolls down
        fab.nativeView.hideOnScroll = list.nativeView;
    });
    const bottomItems = [
        { text: 'Home', icon: icon('house', 'ic_star'), onTap: () => (log = 'bottom: home') },
        { spacer: true },
        { text: 'Add', icon: icon('plus', 'ic_add'), onTap: () => (log = 'bottom: add') }
    ];
    let log = 'size / behavior / translucent: use the buttons';

    const formatted = new FormattedString();
    const first = new Span();
    first.text = 'Inbox ';
    const second = new Span();
    second.text = '♥';
    second.color = new Color('#ff8a80');
    formatted.spans.push(first, second);

    // a gesturehandler pan on a view of the page: it must keep working inside the AppPage root
    function attachPan(e) {
        const handler = Manager.getInstance().createGestureHandler(HandlerType.PAN, 1234, {});
        handler.on(GestureHandlerStateEvent, (args) => {
            if (args.data.state === GestureState.END) {
                log = `pan end ${Math.round(args.data.extraData?.translationX)}, ${Math.round(args.data.extraData?.translationY)}`;
            }
        });
        handler.attachToView(e.object);
    }
</script>

<appPage>
    <appBar bind:this={bar} title="App bar" subtitle="{size} / {behavior}{translucent ? " / translucent" : ""}" {size} scrollBehavior={behavior} {translucent} {bottomItems} formattedTitle={spans ? formatted : null} searchable searchHint="Filter rows" on:searchChange={(e) => (query = e.text)} on:searchCancel={() => (query = '')}>
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
        <appBarItem text="More" icon={icon('ellipsis', 'ic_add')} ios.position="right" android.position="actionBar" {menu} />
        <appBarItem text="Edit" prominent ios.position="right" android.position="popup" on:tap={() => (log = 'edit tapped')} />
    </appBar>
    <collectionview bind:this={list} {items} rowHeight="56">
        <Template let:item>
            <label text={item.title} padding="0 16" verticalAlignment="center" backgroundColor={item.title.length % 2 ? '#f3edf7' : '#ffffff'} />
        </Template>
    </collectionview>
    <appPageOverlay>
        <uifloatingactionbutton bind:this={fab} horizontalAlignment="right" verticalAlignment="bottom" marginBottom="260" src={icon('plus', 'ic_add')} on:tap={() => (log = 'fab tapped')} />
        <stackLayout verticalAlignment="bottom" marginBottom="90" backgroundColor="rgba(255,255,255,0.92)" padding="8 8 8 8">
            <label text={log} on:loaded={attachPan} padding="8" backgroundColor="#c8e6c9" />
            <wrapLayout>
                <uibutton text="small" on:tap={() => (size = 'small')} />
                <uibutton text="medium" on:tap={() => (size = 'medium')} />
                <uibutton text="large" on:tap={() => (size = 'large')} />
                <uibutton text="none" on:tap={() => (behavior = 'none')} />
                <uibutton text="lift" on:tap={() => (behavior = 'lift')} />
                <uibutton text="hide" on:tap={() => (behavior = 'hide')} />
                <uibutton text="translucent" on:tap={() => (translucent = !translucent)} />
                <uibutton text="spans" on:tap={() => (spans = !spans)} />
            </wrapLayout>
        </stackLayout>
    </appPageOverlay>
</appPage>
