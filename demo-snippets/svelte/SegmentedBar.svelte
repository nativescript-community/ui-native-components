<script lang="ts">
    import { Color, FormattedString, Frame, Span } from '@nativescript/core';
    let index = 0;
    let iconIndex = 1;
    const heart = new FormattedString();
    const heartSpan = new Span();
    heartSpan.text = '♥';
    heartSpan.color = new Color('#d32f2f');
    heart.spans.push(heartSpan);
    const titles = ['Day', 'Week', 'Month'];
    const mixedTitles = ['Grid', 'Hue', 'Sliders'];
</script>

<page>
    <actionBar title="Segmented bar">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <scrollView>
        <stackLayout class="demo">
            <label class="title" text={`titles: ${titles[index]}`} />
            <uisegmentedbar selectedIndex={index} on:selectedIndexChange={(e) => (index = e.value)}>
                {#each titles as title}
                    <uisegmentedbaritem {title} />
                {/each}
            </uisegmentedbar>

            <label class="title" text={`icons: ${iconIndex}`} />
            <uisegmentedbar selectedIndex={iconIndex} on:selectedIndexChange={(e) => (iconIndex = e.value)}>
                <uisegmentedbaritem src={__IOS__ ? 'sys://list.bullet' : 'res://ic_add'} />
                <uisegmentedbaritem src={__IOS__ ? 'sys://square.grid.2x2' : 'res://ic_star'} />
                <uisegmentedbaritem src={__IOS__ ? 'sys://map' : 'res://ic_add'} />
                <uisegmentedbaritem src={heart} />
            </uisegmentedbar>

            <label class="title" text="spans (formattedText)" />
            <uisegmentedbar selectedIndex="0">
                <uisegmentedbaritem>
                    <formattedstring>
                        <span text="Bold " fontWeight="bold" />
                        <span text="red" color="#d32f2f" />
                    </formattedstring>
                </uisegmentedbaritem>
                <uisegmentedbaritem>
                    <formattedstring>
                        <span text="Big" fontSize="22" />
                        <span text=" small" fontSize="11" />
                    </formattedstring>
                </uisegmentedbaritem>
            </uisegmentedbar>

            <label class="title" text="widths by content (default)" />
            <uisegmentedbar horizontalAlignment="center" selectedIndex="0">
                {#each mixedTitles as title}
                    <uisegmentedbaritem {title} />
                {/each}
            </uisegmentedbar>

            <label class="title" text="equal widths (apportionsSegmentWidthsByContent=false)" />
            <uisegmentedbar horizontalAlignment="center" apportionsSegmentWidthsByContent={false} selectedIndex="0">
                {#each mixedTitles as title}
                    <uisegmentedbaritem {title} />
                {/each}
            </uisegmentedbar>

            <label class="title" text="by content, bar width=360" />
            <uisegmentedbar horizontalAlignment="center" width="360" selectedIndex="0">
                {#each mixedTitles as title}
                    <uisegmentedbaritem {title} />
                {/each}
            </uisegmentedbar>

            <label class="title" text="equal, bar width=360" />
            <uisegmentedbar horizontalAlignment="center" width="360" apportionsSegmentWidthsByContent={false} selectedIndex="0">
                {#each mixedTitles as title}
                    <uisegmentedbaritem {title} />
                {/each}
            </uisegmentedbar>

            <label class="title" text="stretched, by content" />
            <uisegmentedbar selectedIndex="0">
                {#each mixedTitles as title}
                    <uisegmentedbaritem {title} />
                {/each}
            </uisegmentedbar>

            <label class="title" text="explicit segment width (Grid=90, Hue=120)" />
            <uisegmentedbar horizontalAlignment="center" selectedIndex="0">
                <uisegmentedbaritem title="Grid" width="90" />
                <uisegmentedbaritem title="Hue" width="120" />
                <uisegmentedbaritem title="Sliders" />
            </uisegmentedbar>

            <label class="title" text="segment too narrow (Sliders=70, truncated)" />
            <uisegmentedbar horizontalAlignment="center" selectedIndex="0">
                <uisegmentedbaritem title="Grid" />
                <uisegmentedbaritem title="Sliders" width="70" />
            </uisegmentedbar>
        </stackLayout>
    </scrollView>
</page>
