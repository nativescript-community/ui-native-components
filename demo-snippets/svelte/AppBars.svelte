<script lang="ts">
    import { Frame, FormattedString, Span, Color } from '@nativescript/core';
    import { onMount } from 'svelte';
    import { Template } from '@nativescript-community/svelte-native/components';
    import { GestureHandlerStateEvent, GestureState, HandlerType, Manager } from '@nativescript-community/gesturehandler';
    import type { AppBarScrollBehavior, AppBarSize } from '@nativescript-community/ui-appbar';

    const items = Array.from({ length: 80 }, (_, i) => ({ title: `row ${i + 1}` }));
    let size: AppBarSize = 'large';
    let behavior: AppBarScrollBehavior = 'lift';
    let translucent = false;
    let spans = false;
    let bar;
    let list;
    // the bar follows the scrolling list (iOS: large title collapse)
    onMount(() => {
        bar.nativeView.scrollTarget = list.nativeView;
    });
    let log = 'swipe the green area (gesturehandler pan)';

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
    <appBar bind:this={bar} title="App bar" subtitle={size === "small" ? `${size} / ${behavior}` : null} {size} scrollBehavior={behavior} {translucent} formattedTitle={spans ? formatted : null}>
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </appBar>
    <gridLayout rows="auto,*">
        <stackLayout>
            <label text={log} backgroundColor="#c8e6c9" padding="16" on:loaded={attachPan} />
            <wrapLayout padding="4 8">
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
        <collectionview bind:this={list} row="1" {items} rowHeight="48">
            <Template let:item>
                <label text={item.title} padding="0 16" verticalAlignment="center" />
            </Template>
        </collectionview>
    </gridLayout>
</appPage>
