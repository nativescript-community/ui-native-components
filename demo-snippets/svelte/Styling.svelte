<script lang="ts">
    import { Frame } from '@nativescript/core';
    import { Template } from '@nativescript-community/svelte-native/components';
    // the same style on each component: a yellow background, a red 3 border, a 16 radius, a 14 24 padding
    const style = 'background-color: #fff3c4; border-width: 3; border-color: #d32f2f; border-radius: 16; padding: 14 24;';
</script>

<page>
    <actionBar title="Styling audit">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo" padding="12">
            <label class="title" text="all: background-color, border 3 red, radius 16, padding 14 24" textWrap="true" />

            <label text="button" />
            <uibutton text="button" {style} />
            <label text="floating action button" />
            <uifloatingactionbutton src="res://ic_add" {style} horizontalAlignment="left" />
            <label text="text field" />
            <uitextfield hint="text field" {style} />
            <label text="text view" />
            <uitextview hint="text view" height="70" {style} />
            <label text="switch" />
            <uiswitch checked="true" {style} horizontalAlignment="left" />
            <label text="slider" />
            <uislider value="40" minValue="0" maxValue="100" {style} />
            <label text="progress" />
            <uiprogress value="60" maxValue="100" {style} />
            <label text="activity indicator" />
            <uiactivityindicator busy="true" width="48" height="48" horizontalAlignment="left" {style} />
            <label text="segmented bar" />
            <uisegmentedbar selectedIndex="0" {style}>
                <uisegmentedbaritem title="One" />
                <uisegmentedbaritem title="Two" />
            </uisegmentedbar>
            <label text="search bar" />
            <uisearchbar hint="search bar" {style} />
            <label text="checkbox" />
            <uicheckbox text="checkbox" checked="true" {style} />
            <label text="refresh layout (with a label)" />
            <uirefreshlayout height="60" {style}>
                <label text="inside the refresh layout" />
            </uirefreshlayout>
        </stackLayout>
    </scrollView>
</page>
