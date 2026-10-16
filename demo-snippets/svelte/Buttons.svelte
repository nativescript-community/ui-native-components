<script lang="ts">
    import { Frame } from '@nativescript/core';
    // system image on iOS (SF Symbol), drawable on Android
    const plus = __IOS__ ? 'sys://plus' : 'res://ic_add';
    const star = __IOS__ ? 'sys://star.fill' : 'res://ic_star';
    // cross platform (Material names) and iOS only (native names, mapped to the closest Material variant on Android)
    const materialVariants = ['contained', 'flat', 'outline', 'text'];
    const iosVariants = ['prominentGlass', 'glass', 'clearGlass', 'prominentClearGlass', 'filled', 'tinted', 'gray', 'plain', 'bordered', 'borderedTinted', 'borderedProminent', 'borderless'];
    let busy = false;
    let taps = 0;
    function onTap(event) {
        taps++;
        console.log('Button tapped', event.object.text);
    }
    function toggleBusy() {
        busy = !busy;
    }
</script>

<page>
    <actionBar title="Buttons">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <label class="title" text="Material variants (same on every platform)" />
            {#each materialVariants as variant}
                <uibutton {variant} text={variant} on:tap={onTap} />
            {/each}

            <label class="title" text="iOS variants (Liquid Glass on iOS 26+, closest Material variant on Android)" />
            {#each iosVariants as variant}
                <uibutton {variant} text={variant} on:tap={onTap} />
            {/each}

            <label class="title" text="Roles" />
            <uibutton role="primary" text="primary" on:tap={onTap} />
            <uibutton role="cancel" variant="flat" text="cancel" on:tap={onTap} />
            <uibutton role="destructive" text="destructive" on:tap={onTap} />
            <uibutton role="destructive" variant="outline" text="destructive outline" on:tap={onTap} />

            <label class="title" text="Busy (iOS only)" />
            <uibutton {busy} text={busy ? 'Working...' : 'Start'} on:tap={toggleBusy} />

            <label class="title" text="Icon, font, color, shape" />
            <uibutton src={plus} text="with icon" on:tap={onTap} />
            <uibutton src={star} variant="text" color="red" text="icon and tint" on:tap={onTap} />
            <uibutton fontSize="22" fontWeight="bold" text="big and bold" on:tap={onTap} />
            <uibutton color="yellow" text="yellow text" on:tap={onTap} />
            <uibutton backgroundColor="orange" borderRadius="8" borderWidth="2" borderColor="red" text="background, radius and border" on:tap={onTap} />
            <uibutton padding="24" variant="flat" text="padding 24" on:tap={onTap} />
            <uibutton text="disabled" isEnabled="false" on:tap={onTap} />
            <label class="footer" text={`taps: ${taps}`} />
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
    .footer {
        margin-top: 16;
    }
    uibutton {
        margin-top: 6;
    }
</style>
