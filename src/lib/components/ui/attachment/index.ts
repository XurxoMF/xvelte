import type { ActionProps } from "./attachment-action.svelte";
import type { ActionsProps } from "./attachment-actions.svelte";
import type { ContentProps } from "./attachment-content.svelte";
import type { DescriptionProps } from "./attachment-description.svelte";
import type { GroupProps } from "./attachment-group.svelte";
import type { MediaProps, MediaVariants } from "./attachment-media.svelte";
import type { RootOrientations, RootProps, RootSizes, AttachmentState } from "./attachment-root.svelte";
import type { TitleProps } from "./attachment-title.svelte";
import type { TriggerProps } from "./attachment-trigger.svelte";

import Action from "./attachment-action.svelte";
import Actions from "./attachment-actions.svelte";
import Content from "./attachment-content.svelte";
import Description from "./attachment-description.svelte";
import Group from "./attachment-group.svelte";
import Media, { mediaVariants } from "./attachment-media.svelte";
import Root, { rootVariants } from "./attachment-root.svelte";
import Title from "./attachment-title.svelte";
import Trigger from "./attachment-trigger.svelte";

export {
	Root,
	Group,
	Media,
	Content,
	Title,
	Description,
	Actions,
	Action,
	Trigger,
	//
	type RootProps,
	type RootSizes,
	type RootOrientations,
	type AttachmentState,
	type GroupProps,
	type MediaProps,
	type MediaVariants,
	type ContentProps,
	type TitleProps,
	type DescriptionProps,
	type ActionsProps,
	type ActionProps,
	type TriggerProps,
	//
	rootVariants,
	mediaVariants
};
