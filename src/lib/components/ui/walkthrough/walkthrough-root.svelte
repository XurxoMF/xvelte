<script lang="ts" module>
	import type { Snippet } from "svelte";

	import type { Step, WalkthroughContext } from "./walkthrough-context";

	export type RootProps = {
		steps: Step[];
		open: boolean;
		onComplete?: (() => void) | undefined;
		children?: Snippet<[WalkthroughContext]> | undefined;
		padding?: number | undefined;
	};
</script>

<script lang="ts">
	import WalkthroughContent from "./walkthrough-content.svelte";
	import { setWalkthroughContext } from "./walkthrough-context";
	import WalkthroughSpotlight from "./walkthrough-spotlight.svelte";

	let { steps = [], open = $bindable(false), onComplete, children, padding }: RootProps = $props();

	let currentStepIndex = $state(0);
	let highlightRect = $state({ top: 0, left: 0, width: 0, height: 0 });

	const isLastStep = $derived(currentStepIndex === steps.length - 1);
	const currentStep = $derived(steps[currentStepIndex]);

	/** Advances to the next step or completes the walkthrough at the end. */
	function next() {
		if (!isLastStep) currentStepIndex++;
		else finish();
	}

	/** Returns to the previous step when one exists. */
	function prev() {
		if (currentStepIndex > 0) currentStepIndex--;
	}

	/** Closes the walkthrough without completing it. */
	function close() {
		open = false;
	}

	/** Closes the walkthrough, then resets progress after the exit transition. */
	function finish() {
		open = false;
		setTimeout(() => {
			currentStepIndex = 0;
			if (onComplete) onComplete();
		}, 300);
	}

	setWalkthroughContext({
		get isOpen() {
			return open;
		},
		get currentStepIndex() {
			return currentStepIndex;
		},
		get currentStep() {
			return currentStep;
		},
		get isLastStep() {
			return isLastStep;
		},
		next,
		prev,
		close
	});
</script>

<WalkthroughSpotlight {open} top={highlightRect.top} left={highlightRect.left} width={highlightRect.width} height={highlightRect.height} />

{#if open && currentStep}
	<WalkthroughContent
		targetId={currentStep.target}
		placement={currentStep.position}
		onUpdateRect={(rect) => (highlightRect = rect)}
		contentSnippet={children}
		{padding}
	/>
{/if}
