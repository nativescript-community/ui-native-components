<script lang="ts">
    /**
     * The demo menu, in one of two modes.
     *
     * A plain button LIST is the seed's default and needs nothing from the snippets. When they
     * export `sections` - a title, a description and optionally a screenshot per demo - a GRID is
     * offered too, and the toolbar switches between them. Neither is required: a snippet package
     * that exports only `demos` still works, unchanged.
     */
    import { navigate } from '@nativescript-community/svelte-native';
    import { onMount } from 'svelte';
    import * as snippets from '../../demo-snippets/svelte/install';
    import { Screen } from '@nativescript/core';

    interface Entry {
        name: string;
        path: string;
        description?: string;
        /** A URL, so the grid needs no asset rule in this app's bundler. */
        image?: string | null;
        component: any;
    }
    interface Section {
        id: string;
        title: string;
        description: string;
        demos: Entry[];
    }

    const demos: Entry[] = (snippets as any).demos ?? [];
    const sections: Section[] = (snippets as any).sections ?? [];

    /** The grid is only worth offering when a demo carries more than a name. */
    const hasMetadata = sections.some((section) => section.demos.some((demo) => demo.description || demo.image));

    let grid = hasMetadata;

    /** A card wants about this much width to keep its screenshot readable - the Android rule. */
    const CARD_WIDTH = 190;
    const columns = Math.max(1, Math.floor(Screen.mainScreen.widthDIPs / CARD_WIDTH));

    /** Cards laid out row by row: a wrapLayout cannot give them an equal share of the width. */
    function rows(entries: Entry[]) {
        const out: Entry[][] = [];
        for (let i = 0; i < entries.length; i += columns) {
            out.push(entries.slice(i, i + columns));
        }
        return out;
    }

    function goToDemo(component) {
        navigate({
            page: component,
            animated: true,
            transition: {
                name: 'slideLeft',
                duration: 200,
                curve: 'ease'
            }
        });
    }

    onMount(() => {
        if (demoRedirect) {
            const Demo = demos.find(({ path }) => path === demoRedirect);
            if (Demo) {
                setTimeout(() => {
                    navigate({
                        //@ts-ignore
                        page: Demo.component,
                        animated: false
                    });
                }, 0);
            }
        }
    });
</script>

<page>
    <actionBar title="Svelte Demo">
        {#if hasMetadata}
            <actionItem ios.position="right" android.position="actionBar" text={grid ? 'List' : 'Grid'} on:tap={() => (grid = !grid)} />
        {/if}
    </actionBar>

    <scrollView>
        {#if grid}
            <stackLayout class="gallery">
                {#each sections as section}
                    <stackLayout class="gallery-header">
                        <label class="gallery-section-title" text={section.title} />
                        {#if section.description}
                            <label class="gallery-section-description" text={section.description} textWrap="true" />
                        {/if}
                    </stackLayout>

                    {#each rows(section.demos) as row}
                        <gridLayout columns={Array(columns).fill('*').join(',')}>
                            {#each row as demo, column}
                                <stackLayout class="gallery-card" col={column} on:tap={() => goToDemo(demo.component)}>
                                    {#if demo.image}
                                        <!-- a remote URL: async, or the first scroll blocks on the network -->
                                        <image class="gallery-card-image" loadMode="async" src={demo.image} stretch="aspectFill" />
                                    {:else}
                                        <gridLayout class="gallery-card-image gallery-card-placeholder">
                                            <label horizontalAlignment="center" text={demo.name.slice(0, 1)} verticalAlignment="center" />
                                        </gridLayout>
                                    {/if}
                                    <label class="gallery-card-title" text={demo.name} textWrap="true" />
                                    {#if demo.description}
                                        <label class="gallery-card-description" maxLines="3" text={demo.description} textWrap="true" />
                                    {/if}
                                </stackLayout>
                            {/each}
                        </gridLayout>
                    {/each}
                {/each}
            </stackLayout>
        {:else}
            <stackLayout>
                {#each demos as demo}
                    <uibutton variant="flat" text={demo.name} on:tap={() => goToDemo(demo.component)} />
                {/each}
            </stackLayout>
        {/if}
    </scrollView>
</page>

<style>
    .gallery {
        padding-bottom: 24;
    }
    .gallery-header {
        padding: 20 14 6 14;
    }
    .gallery-section-title {
        font-size: 18;
        font-weight: 600;
    }
    .gallery-section-description {
        font-size: 13;
        opacity: 0.6;
    }
    .gallery-card {
        margin: 6;
        padding-bottom: 10;
        border-radius: 10;
        background-color: #ffffff;
        android-elevation: 2;
    }
    .gallery-card-image {
        height: 108;
        border-top-left-radius: 10;
        border-top-right-radius: 10;
    }
    .gallery-card-placeholder {
        background-color: #e8e4de;
        font-size: 28;
        color: #b3aca3;
    }
    .gallery-card-title {
        padding: 8 10 0 10;
        font-size: 14;
        font-weight: 600;
    }
    .gallery-card-description {
        padding: 2 10 0 10;
        font-size: 12;
        opacity: 0.65;
    }
</style>
