import type {
	QuestionnaireChoiceDefinition,
	QuestionnaireInputType,
	QuestionnaireItemDefinition,
	QuestionnaireItemStatus,
	QuestionnaireShortcutMode
} from "@shadcn-svelte/primitives/questionnaire";
import type { ActionsProps } from "./questionnaire-actions.svelte";
import type { ChoiceDescriptionProps } from "./questionnaire-choice-description.svelte";
import type { ChoiceProps } from "./questionnaire-choice.svelte";
import type { ChoicesProps } from "./questionnaire-choices.svelte";
import type { DescriptionProps } from "./questionnaire-description.svelte";
import type { ErrorProps } from "./questionnaire-error.svelte";
import type { InputProps } from "./questionnaire-input.svelte";
import type { ItemProps } from "./questionnaire-item.svelte";
import type { NextProps } from "./questionnaire-next.svelte";
import type { PreviousProps } from "./questionnaire-previous.svelte";
import type { ProgressProps } from "./questionnaire-progress.svelte";
import type { RootProps } from "./questionnaire-root.svelte";
import type { SkipProps } from "./questionnaire-skip.svelte";
import type { SubmitProps } from "./questionnaire-submit.svelte";
import type { TitleProps } from "./questionnaire-title.svelte";

import Actions from "./questionnaire-actions.svelte";
import ChoiceDescription from "./questionnaire-choice-description.svelte";
import Choice from "./questionnaire-choice.svelte";
import Choices from "./questionnaire-choices.svelte";
import Description from "./questionnaire-description.svelte";
import Error from "./questionnaire-error.svelte";
import Input from "./questionnaire-input.svelte";
import Item from "./questionnaire-item.svelte";
import Next from "./questionnaire-next.svelte";
import Previous from "./questionnaire-previous.svelte";
import Progress from "./questionnaire-progress.svelte";
import Root from "./questionnaire-root.svelte";
import Skip from "./questionnaire-skip.svelte";
import Submit from "./questionnaire-submit.svelte";
import Title from "./questionnaire-title.svelte";

/** Fixed-choice metadata supplied to Root before parts register. */
type ChoiceDefinition = QuestionnaireChoiceDefinition;

/** Supported native input types for a freeform answer. */
type InputType = QuestionnaireInputType;

/** Ordered question metadata supplied to Root for SSR, progress, and shortcuts. */
type ItemDefinition = QuestionnaireItemDefinition;

/** Answer state reported by a Questionnaire item. */
type ItemStatus = QuestionnaireItemStatus;

/** Keyboard shortcut assignment modes for fixed choices. */
type ShortcutMode = QuestionnaireShortcutMode;

export {
	Root,
	Progress,
	Item,
	Title,
	Description,
	Choices,
	Choice,
	ChoiceDescription,
	Input,
	Error,
	Actions,
	Previous,
	Skip,
	Next,
	Submit,
	//
	type RootProps,
	type ProgressProps,
	type ItemProps,
	type TitleProps,
	type DescriptionProps,
	type ChoicesProps,
	type ChoiceProps,
	type ChoiceDescriptionProps,
	type InputProps,
	type ErrorProps,
	type ActionsProps,
	type PreviousProps,
	type SkipProps,
	type NextProps,
	type SubmitProps,
	//
	type ChoiceDefinition,
	type InputType,
	type ItemDefinition,
	type ItemStatus,
	type ShortcutMode
};
