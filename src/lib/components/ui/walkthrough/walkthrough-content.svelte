<script lang="ts">
	import { arrow, autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
	import { tick, untrack } from "svelte";

	import type { Placement } from "@floating-ui/dom";
	import type { Snippet } from "svelte";
	import type { WalkthroughContext } from "./walkthrough-context";

	import { getWalkthroughContext } from "./walkthrough-context";

	import { CloseIcon } from "$lib/icons";

	import * as m from "$lib/paraglide/messages.js";

	import * as Button from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";

	let {
		targetId,
		placement = "bottom",
		onUpdateRect,
		contentSnippet,
		padding = 0
	}: {
		targetId: string;
		placement?: "top" | "bottom" | "left" | "right" | undefined;
		onUpdateRect: (rect: { top: number; left: number; width: number; height: number }) => void;
		contentSnippet?: Snippet<[WalkthroughContext]> | undefined;
		padding?: number | undefined;
	} = $props();

	const ctx = getWalkthroughContext();

	let tooltipEl = $state<HTMLElement | null>(null);
	let primaryActionEl = $state<HTMLElement | null>(null);
	let arrowEl = $state<HTMLElement | null>(null);
	let previouslyFocused: HTMLElement | null = null;

	let actualPlacement = $state<Placement>(untrack(() => placement));

	/**
	 * Measures the target and publishes a rectangle expanded by the configured padding.
	 *
	 * @param el - Element that the current walkthrough step highlights.
	 */
	function updateSpotlight(el: HTMLElement) {
		const rect = el.getBoundingClientRect();

		onUpdateRect({
			top: rect.top - padding,
			left: rect.left - padding,
			width: rect.width + padding * 2,
			height: rect.height + padding * 2
		});
	}

	/** Places focus on the default primary action without moving the positioned card. */
	function focusPrimaryAction() {
		primaryActionEl?.focus({ preventScroll: true });
	}

	/**
	 * Replaces Dialog's default opening focus only for the built-in walkthrough card.
	 *
	 * @param event - Bits UI's cancellable opening autofocus event.
	 */
	function handleOpenAutoFocus(event: Event) {
		previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		if (contentSnippet) return;
		event.preventDefault();
		void tick().then(focusPrimaryAction);
	}

	/**
	 * Restores focus for controlled walkthroughs, which do not own a Dialog Trigger.
	 *
	 * @param event - Bits UI's cancellable closing autofocus event.
	 */
	function handleCloseAutoFocus(event: Event) {
		if (!previouslyFocused?.isConnected) return;
		event.preventDefault();
		previouslyFocused.focus({ preventScroll: true });
		previouslyFocused = null;
	}

	$effect(() => {
		const contentEl = tooltipEl;
		const targetEl = document.getElementById(targetId);
		if (!ctx.isOpen || !contentEl || !targetEl) return;

		updateSpotlight(targetEl);

		// Check every viewport edge before scrolling, avoiding movement for already visible targets.
		const rect = targetEl.getBoundingClientRect();
		const isVisible =
			rect.top >= 0 &&
			rect.left >= 0 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
			rect.right <= (window.innerWidth || document.documentElement.clientWidth);

		if (!isVisible) targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

		const middleware = [offset(12), flip(), shift({ padding: 10 })];
		if (arrowEl) middleware.push(arrow({ element: arrowEl }));

		// Recalculate both the spotlight and tooltip whenever layout or scroll position changes.
		return autoUpdate(targetEl, contentEl, () => {
			updateSpotlight(targetEl);

			void computePosition(targetEl, contentEl, {
				placement,
				middleware,
				strategy: "fixed"
			}).then(({ x, y, placement: finalPlacement, middlewareData }) => {
				Object.assign(contentEl.style, {
					left: `${x}px`,
					top: `${y}px`,
					position: "fixed",
					display: "block"
				});

				actualPlacement = finalPlacement;

				if (arrowEl && middlewareData.arrow) {
					const { x: arrowX, y: arrowY } = middlewareData.arrow;
					const staticSide = {
						top: "bottom",
						right: "left",
						bottom: "top",
						left: "right"
					}[finalPlacement.split("-")[0]];

					Object.assign(arrowEl.style, {
						left: arrowX != null ? `${arrowX}px` : "",
						top: arrowY != null ? `${arrowY}px` : "",
						right: "",
						bottom: "",
						[staticSide as string]: "-4px"
					});
				}
			});
		});
	});

	$effect(() => {
		const stepIndex = ctx.currentStepIndex;
		if (!ctx.isOpen || contentSnippet) return;

		void tick().then(() => {
			if (ctx.isOpen && ctx.currentStepIndex === stepIndex) focusPrimaryAction();
		});
	});

	let arrowClasses = $derived.by(() => {
		const side = actualPlacement.split("-")[0];
		const base = "absolute h-2 w-2 rotate-45 bg-popover";
		if (side === "top") return `${base} border-b border-r`;
		if (side === "bottom") return `${base} border-t border-l`;
		if (side === "left") return `${base} border-t border-r`;
		if (side === "right") return `${base} border-b border-l`;
		return `${base} border-t border-l`;
	});
</script>

<Dialog.Content
	bind:ref={tooltipEl}
	showOverlay={false}
	showCloseButton={false}
	preventScroll={false}
	interactOutsideBehavior="ignore"
	onOpenAutoFocus={handleOpenAutoFocus}
	onCloseAutoFocus={handleCloseAutoFocus}
	data-slot="walkthrough-content"
	class="fixed top-0 left-0 z-9999 block w-max max-w-none translate-x-0 translate-y-0 gap-0 rounded-none bg-transparent p-0 text-base text-inherit ring-0 duration-200 sm:max-w-none data-open:zoom-in-100 data-closed:zoom-out-100"
>
	{#if contentSnippet}
		<Dialog.Title class="sr-only">{ctx.currentStep?.title}</Dialog.Title>
		<Dialog.Description class="sr-only">{ctx.currentStep?.description}</Dialog.Description>

		{@render contentSnippet(ctx)}
	{:else}
		<div class="relative w-87.5 rounded-lg border bg-popover text-popover-foreground shadow-xl">
			<div bind:this={arrowEl} class={arrowClasses}></div>

			<div class="p-4">
				<div class="flex items-start justify-between gap-4">
					<div class="space-y-1">
						<Dialog.Title class="leading-none font-semibold">{ctx.currentStep?.title}</Dialog.Title>

						<Dialog.Description>{ctx.currentStep?.description}</Dialog.Description>
					</div>

					<Dialog.Close>
						{#snippet child({ props })}
							<Button.Root {...props} variant="ghost" size="icon" class="-mt-1 -mr-2 h-6 w-6 shrink-0" aria-label={m.silver_moth_close_walkthrough()}>
								<CloseIcon class="h-4 w-4" aria-hidden="true" />
							</Button.Root>
						{/snippet}
					</Dialog.Close>
				</div>

				<div class="flex items-center justify-between pt-4">
					<span class="text-xs text-muted-foreground">
						{m.dry_wolf_step({ step: ctx.currentStepIndex + 1 })}
					</span>

					<div class="flex gap-2">
						{#if ctx.currentStepIndex > 0}
							<Button.Root variant="outline" size="sm" onclick={ctx.prev}>{m.even_palm_back()}</Button.Root>
						{/if}

						<Button.Root bind:ref={primaryActionEl} size="sm" onclick={ctx.next}>
							{ctx.isLastStep ? m.flint_dove_finish() : m.young_elm_next()}
						</Button.Root>
					</div>
				</div>
			</div>
		</div>
	{/if}
</Dialog.Content>
