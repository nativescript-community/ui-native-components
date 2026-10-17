<script lang="ts">
    import { Frame } from '@nativescript/core';
    const add = __IOS__ ? 'sys://plus.circle' : 'res://ic_add';
    const star = __IOS__ ? 'sys://star.fill' : 'res://ic_star';
    let selected = 0;
    let playing = false;
    let query = '';
    const fruits = ['Apple', 'Apricot', 'Banana', 'Cherry', 'Grape', 'Lemon', 'Mango', 'Orange', 'Peach'];
    $: results = fruits.filter((f) => f.toLowerCase().includes(query.toLowerCase()));
    const rows = Array.from({ length: 40 }, (_, i) => `row ${i + 1}`);
</script>

<page>
    <actionBar title="Bottom navigation">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <uibottomnavigation minimizeBehavior="onScrollDown" searchTab="true" searchHint="Search fruits" selectedIndex={selected} on:search={(e) => (query = e.text)} on:selectedIndexChanged={(e) => (selected = e.newIndex)}>
        <uitabstrip>
            <uitabstripitem>
                <label text="Add" />
                <image src={add} />
            </uitabstripitem>
            <uitabstripitem>
                <label text="Star" />
                <image src={star} />
            </uitabstripitem>
            <uitabstripitem>
                <label text="Third" />
                <image src={add} />
            </uitabstripitem>
        </uitabstrip>
        <uitabcontentitem>
            <scrollView backgroundColor="#e8def8">
                <stackLayout padding="16">
                    <label text="First tab: scroll to minimize the tab bar (iOS 26)" class="h2" textWrap="true" />
                    {#each rows as row}
                        <label text={row} padding="12" />
                    {/each}
                </stackLayout>
            </scrollView>
        </uitabcontentitem>
        <uitabcontentitem>
            <gridLayout backgroundColor="#d0f0c0">
                <label text={`Second tab (selected ${selected})`} class="h2" horizontalAlignment="center" verticalAlignment="center" />
            </gridLayout>
        </uitabcontentitem>
        <uitabcontentitem>
            <gridLayout backgroundColor="#ffe0b2">
                <label text="Third tab" class="h2" horizontalAlignment="center" verticalAlignment="center" />
            </gridLayout>
        </uitabcontentitem>
        <uibottomsearchcontent>
            <stackLayout backgroundColor="white" padding="16">
                <label text={`results for "${query}"`} class="h2" />
                {#each results as fruit}
                    <label text={fruit} padding="12" />
                {/each}
            </stackLayout>
        </uibottomsearchcontent>
        <uibottomaccessory>
            <gridLayout columns="auto,*,auto" padding="0 16" verticalAlignment="center">
                <label text="♪" fontSize="22" verticalAlignment="center" />
                <label col="1" text={playing ? 'Playing: Demo track' : 'Paused: Demo track'} verticalAlignment="center" marginLeft="12" />
                <button col="2" text={playing ? 'Pause' : 'Play'} on:tap={() => (playing = !playing)} />
            </gridLayout>
        </uibottomaccessory>
    </uibottomnavigation>
</page>
