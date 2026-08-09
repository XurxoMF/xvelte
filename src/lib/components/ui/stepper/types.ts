import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
import type { Snippet } from "svelte";

import type { WithChild } from "svelte-toolbelt";

import type { RootProps as ButtonProps } from "$lib/components/ui/button";
import type { WithElementRef } from "$lib/utils";

export type StepperRootProps = {
	step?: number;
	children?: Snippet;
};

export type StepperNavPropsWithoutHTML = {
	orientation?: "horizontal" | "vertical";
};

export type StepperNavProps = StepperNavPropsWithoutHTML & WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export type StepperItemPropsWithoutHTML = {
	id?: string;
};

export type StepperItemProps = StepperItemPropsWithoutHTML & WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, "id">, HTMLDivElement>;

export type StepperButtonPropsWithoutHTML = WithChild<Omit<ButtonProps, "children">>;

export type StepperNextButtonProps = StepperButtonPropsWithoutHTML;
export type StepperPreviousButtonProps = StepperButtonPropsWithoutHTML;

export type StepperTriggerProps = WithElementRef<HTMLButtonAttributes, HTMLButtonElement>;
export type StepperIndicatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type StepperSeparatorProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type StepperTitleProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export type StepperDescriptionProps = WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
