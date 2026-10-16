<script lang="ts">
    import { Frame } from '@nativescript/core';
    const add = __IOS__ ? 'sys://plus.circle' : 'res://ic_add';
    const star = __IOS__ ? 'sys://star.fill' : 'res://ic_star';
    let selected = 0;
</script>

<page>
    <actionBar title="Bottom navigation">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <uibottomnavigation selectedIndex={selected} on:selectedIndexChanged={(e) => (selected = e.newIndex)}>
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
            <gridLayout backgroundColor="#e8def8">
                <label text="First tab" class="h2" horizontalAlignment="center" verticalAlignment="center" />
            </gridLayout>
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
    </uibottomnavigation>
</page>
