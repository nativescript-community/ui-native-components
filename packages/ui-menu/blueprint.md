{{ load:../../tools/readme/edit-warning.md }}
{{ template:title }}
{{ template:badges }}
{{ template:description }}

| iOS | Android |
| --- | --- |
| <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-menu-ios.png" height="500" /> | <img src="https://github.com/nativescript-community/ui-native-components/raw/master/images/ui-menu-android.png" height="500" /> |

{{ template:toc }}

| Android | iOS |
|---|---|
| `PopupMenu` | `UIMenu`, `UIContextMenuInteraction` |

## Installation

```bash
npm install @nativescript-community/ui-menu
```

The Android components use **Material 3**: see the [repository README](https://github.com/nativescript-community/ui-native-components#installation) for the theme.

## Usage

```ts
import { showMenu, setContextMenu } from '@nativescript-community/ui-menu';

const item = await showMenu({
    anchor: button,
    placement: { horizontal: 'end', vertical: 'below' },
    items: [
        { id: 'copy', title: 'Copy', icon: 'sys://doc.on.doc', subtitle: 'to the clipboard' },
        { title: 'Share', items: [{ id: 'link', title: 'Link' }] },
        { separator: true },
        { id: 'delete', title: 'Delete', destructive: true }
    ]
});

// long press
const remove = setContextMenu(label, { items, onSelect: (item) => {} });
```

## API

Menu items: `id`, `title`, `subtitle`, `icon` (resource, file, `sys://`, an ImageSource or a FormattedString), `checked`, `destructive`, `disabled`, `items` (submenu), `separator`, `onSelect`.
`showMenu` resolves with the selected item, or `undefined` when dismissed. `placement`: `horizontal` `start`/`center`/`end`, `vertical` `auto`/`above`/`below`.

{{ load:../../tools/readme/demos-and-development.md }}
{{ load:../../tools/readme/questions.md }}
