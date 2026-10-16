<script lang="ts">
    import { Frame } from '@nativescript/core';
    let taps = 0;
</script>

<page>
    <actionBar title="Card view and ripple">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <label class="title" text="CardView and Ripple are Material components: Android only, plain views on iOS" textWrap="true" />
            <uicardview class="card" elevation="4" rippleColor="#6750a4" on:tap={() => taps++}>
                <stackLayout padding="16">
                    <label text="Card" fontSize="20" fontWeight="bold" />
                    <label text={`tapped ${taps} times`} />
                </stackLayout>
            </uicardview>
            <uicardview class="card" shape="cut" elevation="1">
                <label text="Custom corners" padding="16" />
            </uicardview>
            <uiripple rippleColor="red" class="ripple" on:tap={() => taps++}>
                <label text="Ripple" padding="24" textAlignment="center" />
            </uiripple>
        </stackLayout>
    </scrollView>
</page>

<style>
    .demo {
        padding: 12;
    }
    .title {
        font-weight: bold;
        margin-bottom: 8;
    }
    .card {
        margin: 8;
        border-radius: 12;
        background-color: white;
    }
    .ripple {
        margin: 8;
        background-color: #eeeeee;
    }
</style>
