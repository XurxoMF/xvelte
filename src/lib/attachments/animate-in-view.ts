import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import type { Attachment } from "svelte/attachments";

/** Element types supported by the scroll-animation attachment. */
export type AnimateInViewElement = HTMLElement | SVGElement;

/** Defines how scroll animation behaves when reduced motion is requested. */
export type AnimateInViewReducedMotion = "skip" | "finish" | "allow";

/** GSAP tween properties whose playback and ScrollTrigger ownership remain with the attachment. */
export type AnimateInViewTweenVars = Omit<gsap.TweenVars, "paused" | "scrollTrigger">;

/** ScrollTrigger configuration whose trigger element remains owned by the attachment. */
export type AnimateInViewScrollTriggerVars = Omit<ScrollTrigger.Vars, "trigger">;

/** Values supplied to a custom timeline builder. */
export type AnimateInViewTimelineContext = {
	/** Attached element used as the ScrollTrigger trigger and GSAP selector scope. */
	node: AnimateInViewElement;
	/** Resolved animation target, defaulting to the attached element. */
	target: gsap.TweenTarget;
	/** Selector scoped to descendants of the attached element. */
	select: gsap.utils.SelectorFunc;
	/** GSAP instance used by the attachment. */
	gsap: typeof gsap;
};

/** Values supplied after an animation and its optional ScrollTrigger are created. */
export type AnimateInViewCreatedContext = AnimateInViewTimelineContext & {
	/** Tween or timeline created for this attachment instance. */
	animation: gsap.core.Animation;
	/** ScrollTrigger controlling the animation, omitted when reduced motion finishes the animation immediately. */
	scrollTrigger?: ScrollTrigger | undefined;
	/** Whether the current media-query setup requests reduced motion. */
	reducedMotion: boolean;
};

/** Shared configuration for tween and timeline modes. */
export type AnimateInViewBaseOptions = {
	/** Element, selector, or collection to animate. Selector strings are scoped to the attached element. @default attached element */
	target?: gsap.DOMTarget | undefined;
	/** Native ScrollTrigger options except `trigger`, which is always the attached element. */
	scrollTrigger?: AnimateInViewScrollTriggerVars | undefined;
	/** Reduced-motion policy. @default "finish" */
	reducedMotion?: AnimateInViewReducedMotion | undefined;
	/** Prevents GSAP and ScrollTrigger setup when true. @default false */
	disabled?: boolean | undefined;
	/** Called whenever a media-query setup creates an animation. */
	onCreate?: ((context: AnimateInViewCreatedContext) => void) | undefined;
};

/** Configures a direct GSAP `fromTo` animation. */
export type AnimateInViewTweenOptions = AnimateInViewBaseOptions & {
	/** Initial GSAP tween properties. */
	from: AnimateInViewTweenVars;
	/** Final GSAP tween properties, including duration, easing, callbacks, and plugin values. */
	to: AnimateInViewTweenVars;
	/** Custom timelines are unavailable in direct tween mode. */
	timeline?: never;
};

/** Configures a custom GSAP timeline controlled by ScrollTrigger. */
export type AnimateInViewTimelineOptions = AnimateInViewBaseOptions & {
	/** Populates the paused timeline before ScrollTrigger takes control of it. */
	timeline: (timeline: gsap.core.Timeline, context: AnimateInViewTimelineContext) => void;
	/** Direct tween properties are unavailable in timeline mode. */
	from?: never;
	/** Direct tween properties are unavailable in timeline mode. */
	to?: never;
};

/** Supported configuration modes for `animateInView`. */
export type AnimateInViewOptions = AnimateInViewTweenOptions | AnimateInViewTimelineOptions;

/**
 * Creates a GSAP animation controlled by ScrollTrigger and scoped to the attached element.
 *
 * @param options - Direct tween or custom timeline configuration.
 * @returns An attachment for HTML or SVG trigger elements.
 */
export function animateInView(options: AnimateInViewOptions): Attachment<AnimateInViewElement> {
	return (node) => {
		if (options.disabled) return;

		gsap.registerPlugin(ScrollTrigger);

		const context = gsap.context((gsapContext) => {
			const select = (gsapContext.selector ?? gsap.utils.selector(node)) as gsap.utils.SelectorFunc;
			const target = resolveTarget(options.target, node, select);
			const timelineContext: AnimateInViewTimelineContext = { node, target, select, gsap };
			const media = gsap.matchMedia(node);

			media.add(
				{
					all: "all",
					reducedMotion: "(prefers-reduced-motion: reduce)"
				},
				(mediaContext) => {
					const reducedMotion = mediaContext.conditions?.reducedMotion === true;
					const reducedMotionPolicy = options.reducedMotion ?? "finish";
					if (reducedMotion && reducedMotionPolicy === "skip") return;

					const animation = createAnimation(options, timelineContext);

					if (reducedMotion && reducedMotionPolicy === "finish") {
						animation.progress(1).pause();
						options.onCreate?.({ ...timelineContext, animation, reducedMotion });
						return;
					}

					const scrollTrigger = ScrollTrigger.create({
						...options.scrollTrigger,
						trigger: node,
						animation
					});

					options.onCreate?.({ ...timelineContext, animation, scrollTrigger, reducedMotion });
				}
			);

			return () => media.revert();
		}, node);

		return () => context.revert();
	};
}

/**
 * Resolves selector targets inside the attachment scope while preserving direct GSAP targets.
 *
 * @param target - Optional user-provided target.
 * @param node - Attached trigger element used as the default target.
 * @param select - Selector scoped to the attached trigger.
 * @returns A target accepted by GSAP tweens and timelines.
 */
function resolveTarget(target: gsap.DOMTarget | undefined, node: AnimateInViewElement, select: gsap.utils.SelectorFunc): gsap.TweenTarget {
	if (typeof target === "string") return select(target);
	return target ?? node;
}

/**
 * Builds the paused animation that ScrollTrigger will control.
 *
 * @param options - Direct tween or custom timeline configuration.
 * @param context - Resolved node, target, selector, and GSAP instance.
 * @returns A paused tween or timeline.
 */
function createAnimation(options: AnimateInViewOptions, context: AnimateInViewTimelineContext): gsap.core.Animation {
	if (options.timeline) {
		const timeline = gsap.timeline({ paused: true });
		options.timeline(timeline, context);
		return timeline;
	}

	return gsap.fromTo(context.target, sanitizeTweenVars(options.from), {
		...sanitizeTweenVars(options.to),
		paused: true
	});
}

/**
 * Removes playback fields controlled by the attachment even when they arrive through an untyped object spread.
 *
 * @param vars - User-provided GSAP tween properties.
 * @returns A shallow copy without `paused` or `scrollTrigger`.
 */
function sanitizeTweenVars(vars: AnimateInViewTweenVars): gsap.TweenVars {
	const sanitized = { ...vars } as gsap.TweenVars;
	delete sanitized.paused;
	delete sanitized.scrollTrigger;
	return sanitized;
}
