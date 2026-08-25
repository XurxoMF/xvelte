import type { RootProps } from "./field-root.svelte";
import type { FieldSetProps } from "./field-set.svelte";
import type { LegendProps } from "./field-legend.svelte";
import type { GroupProps } from "./field-group.svelte";
import type { ContentProps } from "./field-content.svelte";
import type { LabelProps } from "./field-label.svelte";
import type { TitleProps } from "./field-title.svelte";
import type { DescriptionProps } from "./field-description.svelte";
import type { SeparatorProps } from "./field-separator.svelte";
import type { ErrorProps } from "./field-error.svelte";

import Field, { rootVariants } from "./field-root.svelte";
import Set from "./field-set.svelte";
import Legend from "./field-legend.svelte";
import Group from "./field-group.svelte";
import Content from "./field-content.svelte";
import Label from "./field-label.svelte";
import Title from "./field-title.svelte";
import Description from "./field-description.svelte";
import Separator from "./field-separator.svelte";
import Error from "./field-error.svelte";

export {
	Field,
	Set,
	Legend,
	Group,
	Content,
	Label,
	Title,
	Description,
	Separator,
	Error,
	//
	type RootProps,
	type FieldSetProps,
	type LegendProps,
	type GroupProps,
	type ContentProps,
	type LabelProps,
	type TitleProps,
	type DescriptionProps,
	type SeparatorProps,
	type ErrorProps,
	//
	rootVariants
};
