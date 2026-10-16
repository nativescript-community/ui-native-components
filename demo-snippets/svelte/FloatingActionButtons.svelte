<script lang="ts">
    import { Frame } from '@nativescript/core';
    const plus = __IOS__ ? 'sys://plus' : 'res://ic_add';
    const star = __IOS__ ? 'sys://star.fill' : 'res://ic_star';
    let expanded = true;
    let fab;
    function toggle() {
        expanded = !expanded;
    }
    function onFabLoaded(event) {
        fab = event.object;
    }
</script>

<page>
    <actionBar title="Floating action buttons">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <gridLayout rows="auto, *">
        <stackLayout row="0" class="demo">
            <label text="normal / mini / extended (tap the extended one to collapse it)" textWrap="true" />
            <wrapLayout>
                <uifloatingactionbutton src={plus} />
                <uifloatingactionbutton src={star} size="mini" />
                <uifloatingactionbutton src={plus} {expanded} text="Extended" on:tap={toggle} on:loaded={onFabLoaded} />
            </wrapLayout>
            <uibutton text="hide the extended one" on:tap={() => fab.hide()} />
            <uibutton text="show the extended one" on:tap={() => fab.show()} />
        </stackLayout>
        <uifloatingactionbutton row="1" src={plus} horizontalAlignment="right" verticalAlignment="bottom" margin="24" />
    </gridLayout>
</page>

<style>
    .demo {
        padding: 12;
    }
</style>
