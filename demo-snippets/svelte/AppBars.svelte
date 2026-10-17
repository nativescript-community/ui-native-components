<script lang="ts">
    import { Frame } from '@nativescript/core';
    import { Template } from '@nativescript-community/svelte-native/components';
    import { GestureHandlerStateEvent, GestureState, HandlerType, Manager } from '@nativescript-community/gesturehandler';
    import type { AppBarScrollBehavior } from '@nativescript-community/ui-appbar';

    const items = Array.from({ length: 80 }, (_, i) => ({ title: `row ${i + 1}` }));
    let behavior: AppBarScrollBehavior = 'hide';
    let log = 'swipe the green area (gesturehandler pan)';

    // a gesturehandler pan on a view of the page: it must keep working inside the AppPage root
    function attachPan(e) {
        const handler = Manager.getInstance().createGestureHandler(HandlerType.PAN, 1234, {});
        handler.on(GestureHandlerStateEvent, (args) => {
            if (args.data.state === GestureState.ACTIVE) {
                log = 'pan active';
            } else if (args.data.state === GestureState.END) {
                log = `pan end ${Math.round(args.data.extraData?.translationX)}, ${Math.round(args.data.extraData?.translationY)}`;
            }
        });
        handler.attachToView(e.object);
    }
</script>

<appPage scrollBehavior={behavior}>
    <actionBar title="App bar ({behavior})">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <gridLayout rows="auto,*">
        <stackLayout>
            <label text={log} backgroundColor="#c8e6c9" padding="16" on:loaded={attachPan} />
            <stackLayout orientation="horizontal" padding="4 8">
                <uibutton text="none" on:tap={() => (behavior = 'none')} />
                <uibutton text="lift" on:tap={() => (behavior = 'lift')} />
                <uibutton text="hide" on:tap={() => (behavior = 'hide')} />
            </stackLayout>
        </stackLayout>
        <collectionview row="1" {items} rowHeight="48">
            <Template let:item>
                <label text={item.title} padding="0 16" verticalAlignment="center" />
            </Template>
        </collectionview>
    </gridLayout>
</appPage>
