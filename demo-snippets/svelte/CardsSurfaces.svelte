<script lang="ts">
    import { Frame } from '@nativescript/core';
    const icon = (ios: string, android: string) => (__IOS__ ? `sys://${ios}` : `res://${android}`);
    let last = '';
</script>

<page>
    <actionBar title="Cards and surfaces">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo" padding="16">
            <label class="title" text="card: content (elevated, filled, outlined)" />
            <uicard variant="elevated" margin="6 0">
                <stackLayout padding="16">
                    <label text="Elevated card" fontWeight="bold" />
                    <label text="Material 3 card on Android, a grouped rounded surface on iOS: no glass for content." textWrap="true" />
                </stackLayout>
            </uicard>
            <uicard variant="filled" margin="6 0">
                <stackLayout padding="16">
                    <label text="Filled card" fontWeight="bold" />
                </stackLayout>
            </uicard>
            <uicard variant="outlined" margin="6 0">
                <stackLayout padding="16">
                    <label text="Outlined card" fontWeight="bold" />
                </stackLayout>
            </uicard>
            <uicard backgroundColor="#fff3c4" borderColor="#d32f2f" borderWidth="2" borderRadius="28" margin="6 0">
                <label text="custom background, border and radius" padding="16" textWrap="true" />
            </uicard>

            <label class="title" text="surface: floating controls over the content (glass on iOS 26)" textWrap="true" />
            <gridLayout height="220" style="background-image: linear-gradient(135deg, #ff7e5f, #6750a4, #00bcd4); border-radius: 24;">
                <uisurface verticalAlignment="bottom" horizontalAlignment="center" margin="0 0 16 0" padding="6">
                    <stackLayout orientation="horizontal">
                        <uibutton width="52" height="52" variant={__IOS__ ? 'plain' : 'text'} src={icon('house', 'ic_star')} on:tap={() => (last = 'home')} />
                        <uibutton width="52" height="52" variant={__IOS__ ? 'plain' : 'text'} src={icon('magnifyingglass', 'ic_add')} on:tap={() => (last = 'search')} />
                        <uibutton width="52" height="52" variant={__IOS__ ? 'plain' : 'text'} src={icon('star', 'ic_star')} on:tap={() => (last = 'star')} />
                        <uibutton width="52" height="52" variant={__IOS__ ? 'plain' : 'text'} src={icon('gear', 'ic_add')} on:tap={() => (last = 'settings')} />
                    </stackLayout>
                </uisurface>
                <uisurface variant="clear" interactive="true" verticalAlignment="top" horizontalAlignment="right" margin="12" padding="4">
                    <uibutton width="52" height="52" variant={__IOS__ ? 'plain' : 'text'} src={icon('xmark', 'ic_add')} on:tap={() => (last = 'close')} />
                </uisurface>
            </gridLayout>
            <label text={`last: ${last}`} />

            <label class="title" text="glass buttons (iOS 26): variant glass / prominentGlass / clearGlass" textWrap="true" />
            <gridLayout height="120" style="background-image: linear-gradient(135deg, #ff7e5f, #6750a4); border-radius: 24;">
                <stackLayout orientation="horizontal" horizontalAlignment="center" verticalAlignment="center">
                    <uibutton variant="glass" src={icon('square.and.arrow.up', 'ic_add')} margin="4" />
                    <uibutton variant="prominentGlass" src={icon('plus', 'ic_add')} margin="4" />
                    <uibutton variant="clearGlass" src={icon('heart', 'ic_star')} margin="4" />
                </stackLayout>
            </gridLayout>
        </stackLayout>
    </scrollView>
</page>
