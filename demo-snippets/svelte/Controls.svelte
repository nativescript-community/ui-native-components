<script lang="ts">
    import { Frame } from '@nativescript/core';
    let checked = true;
    let value = 40;
    let busy = true;
</script>

<page>
    <actionBar title="Switch, slider, progress">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <label class="title" text={`switch: ${checked}`} />
            <uiswitch {checked} on:checkedChange={(e) => (checked = e.value)} onBackgroundColor="#ff8a39" horizontalAlignment="left" />

            <label class="title" text={`slider: ${Math.round(value)}`} />
            <uislider {value} minValue="0" maxValue="100" on:valueChange={(e) => (value = e.value)} />
            <label class="title" text="slider with steps of 25 and custom colors" />
            <uislider value="50" minValue="0" maxValue="100" stepSize="25" trackFillColor="#6750a4" trackBackgroundColor="#d0bcff" thumbColor="#6750a4" />

            <label class="title" text="progress" />
            <uiprogress value={value} maxValue="100" />
            <uiprogress value="70" maxValue="100" progressColor="#ff8a39" progressBackgroundColor="#ffe0b2" />
            <label class="title" text="indeterminate (a spinner on iOS)" />
            <uiprogress indeterminate="true" busy="true" />

            <label class="title" text="activity indicator" />
            <uiactivityindicator {busy} width="48" height="48" horizontalAlignment="left" />
            <uibutton variant="flat" text={busy ? 'stop' : 'start'} on:tap={() => (busy = !busy)} />
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
