<script lang="ts">
    import { Frame } from '@nativescript/core';
    const add = __IOS__ ? 'sys://plus.circle' : 'res://ic_add';
    const star = __IOS__ ? 'sys://star.fill' : 'res://ic_star';
    let selected = 0;
    let pressed = 0;
    let bar;
    function onLoaded(event) {
        bar = event.object;
    }
</script>

<page>
    <actionBar title="Bottom navigation bar">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <gridLayout rows="auto, auto, *, auto">
        <label row="0" text={`selected tab: ${selected}, non selectable pressed: ${pressed}`} margin="12" textWrap="true" />
        <stackLayout row="1" orientation="horizontal" class="actions">
            <uibutton variant="flat" text="show badge" on:tap={() => bar.showBadge(1, 5)} />
            <uibutton variant="flat" text="remove badge" on:tap={() => bar.removeBadge(1)} />
            <uibutton variant="flat" text="select 2" on:tap={() => bar.selectTab(2)} />
        </stackLayout>
        <uibottomnavigationbar
            row="3"
            titleVisibility="always"
            on:loaded={onLoaded}
            on:tabSelected={(e) => (selected = e.newIndex)}
            on:tabPressed={() => pressed++}>
            <uibottomnavigationtab title="Add" icon={add} />
            <uibottomnavigationtab title="Star" icon={star} />
            <uibottomnavigationtab title="Third" icon={add} />
            <uibottomnavigationtab title="Action" icon={star} isSelectable="false" />
        </uibottomnavigationbar>
    </gridLayout>
</page>

<style>
    .actions {
        margin: 0 8;
    }
</style>
