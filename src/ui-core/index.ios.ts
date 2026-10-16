import { Color, View } from '@nativescript/core';
import { ShapeProperties } from '.';
import { cssProperty } from './cssproperties';
import { CornerFamily, applyMixins } from './index.common';
export * from './cssproperties';
export { CornerFamily, applyMixins };

// On iOS the themer is a plain color/shape store. Material only concepts (shapes, color schemes)
// are kept so that the API is the same on all platforms but they are not used by native components.
export class Themer {
    primaryColor: string | Color;
    onPrimaryColor: string | Color;
    secondaryColor: string | Color;
    accentColor: string | Color;
    primaryColorVariant: string | Color;
    surfaceColor: string | Color;
    onSurfaceColor: string | Color;
    backgroundColor: string | Color;
    onBackgroundColor: string | Color;

    getOrcreateAppColorScheme() {}
    getAppColorScheme() {}

    setPrimaryColor(value: string | Color) {
        this.primaryColor = value;
    }
    getPrimaryColor(): string | Color {
        return this.primaryColor;
    }
    setOnPrimaryColor(value: string | Color) {
        this.onPrimaryColor = value;
    }
    getOnPrimaryColor(): string | Color {
        return this.onPrimaryColor;
    }
    setSecondaryColor(value: string | Color) {
        this.secondaryColor = value;
    }
    getSecondaryColor(): string | Color {
        return this.secondaryColor;
    }
    setAccentColor(value: string | Color) {
        this.setSecondaryColor(value);
    }
    getAccentColor(): string | Color {
        return this.getSecondaryColor();
    }
    setSurfaceColor(value: string | Color) {
        this.surfaceColor = value;
    }
    getSurfaceColor(): string | Color {
        return this.surfaceColor;
    }
    setOnSurfaceColor(value: string | Color) {
        this.onSurfaceColor = value;
    }
    getOnSurfaceColor(): string | Color {
        return this.onSurfaceColor;
    }
    setPrimaryColorVariant(value: string | Color) {
        this.primaryColorVariant = value;
    }
    getPrimaryColorVariant(): string | Color {
        return this.primaryColorVariant;
    }
    setBackgroundColor(value: string | Color) {
        this.backgroundColor = value;
    }
    getBackgroundColor(): string | Color {
        return this.backgroundColor;
    }
    setOnBackgroundColor(value: string | Color) {
        this.onBackgroundColor = value;
    }
    getOnBackgroundColor(): string | Color {
        return this.onBackgroundColor;
    }

    _shapes: {
        [k: string]: any;
    } = {};
    getShape(key: string) {
        return this._shapes[key] || null;
    }
    createShape(key: string, options: ShapeProperties) {
        this._shapes[key] = options;
    }
}

export let themer = new Themer();

/**
 * Allows a platform layer (like ui-material) to replace the themer with an extended one
 * while keeping a single instance for every component.
 */
export function _setThemer(value: Themer) {
    if (themer && value !== themer) {
        const previous = themer;
        Object.keys(previous).forEach((k) => {
            if (k !== '_shapes' && value[k] === undefined) {
                value[k] = previous[k];
            }
        });
        // shapes are stored as raw options on iOS, let the new themer create its own representation
        Object.keys(previous._shapes).forEach((k) => value.createShape(k, previous._shapes[k]));
    }
    themer = value;
}

export function install() {}

export function getRippleColor(color: string | Color, alpha = 61.5): UIColor {
    if (color) {
        const temp = color instanceof Color ? color : new Color(color);
        if (temp.a !== 255) {
            return temp.ios;
        }
        return new Color(alpha || 61.5, temp.r, temp.g, temp.b).ios;
    }
    return null;
}

export function overrideViewBase() {
    const NSView = require('@nativescript/core').View;
    // ripple and elevation are Material concepts: on iOS the properties are registered
    // (so they can be set from CSS / templates) but they have no effect.
    class ViewWithFocusHelpers extends View {
        //TODO: remove as it needs to be added after TS 5.7 change https://github.com/microsoft/TypeScript/pull/59860
        [key: symbol]: (...args: any[]) => any | void;

        @cssProperty elevation: number;
        @cssProperty dynamicElevationOffset: number;
        @cssProperty rippleColor: Color;
        @cssProperty rippleColorAlpha: number;

        public requestFocus() {
            this.focus();
        }
        public clearFocus() {
            this.nativeViewProtected?.resignFirstResponder();
        }
    }
    applyMixins(NSView, [ViewWithFocusHelpers], {
        after: true
    });
}

let mixinInstalled = false;
export function installMixins() {
    if (!mixinInstalled) {
        mixinInstalled = true;
        overrideViewBase();
    }
}
