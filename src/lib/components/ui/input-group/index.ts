import type { RootProps } from "./input-group-root.svelte";
import type { AddonProps } from "./input-group-addon.svelte";
import type { ButtonProps, ButtonSizes } from "./input-group-button.svelte";
import type { InputProps } from "./input-group-input.svelte";
import type { TextProps } from "./input-group-text.svelte";
import type { TextareaProps } from "./input-group-textarea.svelte";

import Root from "./input-group-root.svelte";
import Addon from "./input-group-addon.svelte";
import Button, { buttonVariants } from "./input-group-button.svelte";
import Input from "./input-group-input.svelte";
import Text from "./input-group-text.svelte";
import Textarea from "./input-group-textarea.svelte";

export {
	Root,
	Addon,
	Button,
	Input,
	Text,
	Textarea,
	//
	type RootProps,
	type AddonProps,
	type ButtonProps,
	type ButtonSizes,
	type InputProps,
	type TextProps,
	type TextareaProps,
	//
	buttonVariants
};
