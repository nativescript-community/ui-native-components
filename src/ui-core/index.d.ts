/**
 * Core module shared by all augmented components.
 * Android implementations use Material Components, iOS implementations use native UIKit.
 * Material only properties (elevation, ripple, shape...) are registered on all platforms but are no-op on iOS.
 * @module @nativescript-community/ui-core
 */

import { Color, CoreTypes, PercentLength } from '@nativescript/core';

declare module '@nativescript/core/ui/core/view' {
    interface View {
        _getRootFragmentManager(): androidx.fragment.app.FragmentManager;
        clearFocus(): void;
        requestFocus(): void;

        /**
         * @nativescript-community/ui-core {@link installMixins}.
         *
         * Gets or sets the elevation of the view.
         */
        elevation: number;

        /**
         * @nativescript-community/ui-core {@link installMixins}.
         *
         * Gets or sets the dynamic elevation offset of the view.
         */
        dynamicElevationOffset: number;

        /**
         * @nativescript-community/ui-core {@link installMixins}.
         *
         * Gets or sets the ripple-color of the view.
         */
        rippleColor: Color;

        /**
         * @nativescript-community/ui-core {@link installMixins}.
         *
         * Gets or sets the ripple-color alpha of the view.
         */
        rippleColorAlpha: number;
    }
}

export interface TypographyOptions {
    fontFamily?: string;
    fontSize?: number;
}

import { CornerFamily } from './index.common';
export { CornerFamily };
export interface ShapeProperties {
    cornerSize?: number | CoreTypes.LengthPercentUnit | CoreTypes.LengthDipUnit | CoreTypes.LengthPxUnit;
    cornerSizeTopRight?: number | CoreTypes.LengthPercentUnit | CoreTypes.LengthDipUnit | CoreTypes.LengthPxUnit;
    cornerSizeBottomLeft?: number | CoreTypes.LengthPercentUnit | CoreTypes.LengthDipUnit | CoreTypes.LengthPxUnit;
    cornerSizeTopLeft?: number | CoreTypes.LengthPercentUnit | CoreTypes.LengthDipUnit | CoreTypes.LengthPxUnit;
    cornerSizeBottomRight?: number | CoreTypes.LengthPercentUnit | CoreTypes.LengthDipUnit | CoreTypes.LengthPxUnit;
    cornerFamily?: CornerFamily;
    cornerFamilyTopLeft?: CornerFamily;
    cornerFamilyTopRight?: CornerFamily;
    cornerFamilyBottomRight?: CornerFamily;
    cornerFamilyBottomLeft?: CornerFamily;
}

export class Themer {
    getOrcreateAppColorScheme();
    getAppColorScheme();
    setPrimaryColor(value: string | Color);
    getPrimaryColor(): string | Color;
    getSecondaryColor(): string | Color;
    setSecondaryColor(value: string | Color);
    setAccentColor(value: string | Color);
    getAccentColor(): string | Color;
    setPrimaryColorVariant(value: string | Color);
    getPrimaryColorVariant(): string | Color;
    setSurfaceColor(value: string | Color);
    getSurfaceColor(): string | Color;
    setOnSurfaceColor(value: string | Color);
    getOnSurfaceColor(): string | Color;
    setOnPrimaryColor(value: string | Color);
    getOnPrimaryColor(): string | Color;
    createShape(key: string, options: ShapeProperties);
    getShape(key: string): any;
}

export let themer: Themer;
/**
 * Replace the shared themer instance (used by platform layers like ui-material).
 * Values already set on the current themer are copied over.
 */
export function _setThemer(value: Themer);

export { applyMixins } from './index.common';
export * from './cssproperties';

export function install();
export function installMixins();
export function overrideViewBase();
export function getRippleColor(color: string | Color, alpha?: number): any;

type Constructor<T = {}> = new (...args: any[]) => T;
export function mixin<T1 extends Constructor, T2 extends Constructor>(mix1: T1, mix2: T2): (new (...args: any[]) => InstanceType<T1> & InstanceType<T2>) & T1 & T2;
