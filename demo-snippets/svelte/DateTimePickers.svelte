<script lang="ts">
    import { Frame } from '@nativescript/core';
    import { pickDate, pickDateRange, pickDateTime, pickTime } from '@nativescript-community/ui-datetimepicker';
    let result = '';
    const fail = (e) => (result = `error: ${e?.message || e}`);
    const show = (value?: any) => (result = value ? (value.start ? `${value.start.toDateString()} - ${value.end.toDateString()}` : value.toString()) : 'cancelled');
</script>

<page>
    <actionBar title="Date and time pickers">
        <navigationButton text="Back" android.systemIcon="ic_menu_back" on:tap={() => Frame.topmost().goBack()} />
    </actionBar>
    <stackLayout class="demo">
        <uibutton text="pick a date" on:tap={async () => show(await pickDate({ title: 'Pick a date' }))} />
        <uibutton
            text="date between 5 days ago and in 20 days"
            on:tap={async () => show(await pickDate({ minDate: new Date(Date.now() - 5 * 86400000), maxDate: new Date(Date.now() + 20 * 86400000) }))} />
        <uibutton text="pick a time (24h)" on:tap={async () => show(await pickTime({ is24Hour: true, title: 'Pick a time' }))} />
        <uibutton text="pick a time (12h, 15 min steps)" on:tap={async () => show(await pickTime({ is24Hour: false, minuteInterval: 15 }))} />
        <uibutton text="pick a date and a time" on:tap={async () => show(await pickDateTime({ is24Hour: true }))} />
        <uibutton text="date range" on:tap={async () => show(await pickDateRange({ title: 'Pick a range' }))} />
        <uibutton
            text="custom texts, week starts on Monday, typed input"
            on:tap={async () => { try { show(await pickDate({ title: 'Birthday', positiveButtonText: 'Select', negativeButtonText: 'Not now', firstDayOfWeek: 2, inputMode: 'text', tintColor: '#d32f2f', locale: 'fr_FR' })); } catch (e) { fail(e); } }} />
        <uibutton text="wheels style date" on:tap={async () => show(await pickDate({ style: 'wheels' }))} />
        <label class="title" text={`result: ${result}`} textWrap="true" />
    </stackLayout>
</page>
