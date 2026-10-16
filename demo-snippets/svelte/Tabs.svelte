<script lang="ts">
    import { Frame } from '@nativescript/core';
    let selected = 0;
</script>

<page>
    <actionBar title="Tabs">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <uitabs selectedIndex={selected} on:selectedIndexChanged={(e) => (selected = e.newIndex)}>
        <uitabstrip>
            <uitabstripitem>
                <label text="Home" />
            </uitabstripitem>
            <uitabstripitem>
                <label text="Search" />
            </uitabstripitem>
            <uitabstripitem>
                <label text="Settings" />
            </uitabstripitem>
        </uitabstrip>
        <uitabcontentitem>
            <gridLayout backgroundColor="#e8def8">
                <label text="Home (swipe or tap a tab)" class="h2" horizontalAlignment="center" verticalAlignment="center" />
            </gridLayout>
        </uitabcontentitem>
        <uitabcontentitem>
            <gridLayout backgroundColor="#d0f0c0">
                <label text={`Search (selected ${selected})`} class="h2" horizontalAlignment="center" verticalAlignment="center" />
            </gridLayout>
        </uitabcontentitem>
        <uitabcontentitem>
            <gridLayout backgroundColor="#ffe0b2">
                <label text="Settings" class="h2" horizontalAlignment="center" verticalAlignment="center" />
            </gridLayout>
        </uitabcontentitem>
    </uitabs>
</page>
