export type UseRampOptions = {
	/** Function called for every repeated increment. */
	increment: () => void;
	/**
	 * The maximum amount of time it should take to increment the value by 1 in milliseconds
	 * @default 200
	 */
	maxFrequency?: number | undefined;
	/**
	 * The minimum amount of time it should take to increment the value by 1 in milliseconds
	 * @default 25
	 */
	minFrequency?: number | undefined;
	/**
	 * The amount of time to wait in milliseconds before starting to ramp up.
	 * @default 100
	 */
	startDelay?: number | undefined;
	/**
	 * The amount of time it should take to ramp up to the minimum frequency
	 * @default 2500
	 */
	rampUpTime?: number | undefined;
	/** Determines whether incrementing may continue. Returning false resets the ramp. */
	canRamp: () => boolean;
};

/**
 * Creates press-and-hold controls whose repeat interval accelerates over time.
 *
 * @param options - Increment callback, timing values, and continuation predicate.
 * @returns Controls and reactive state for starting or resetting the ramp.
 */
export function useRamp({ increment, maxFrequency = 200, minFrequency = 25, startDelay = 100, rampUpTime = 2500, canRamp }: UseRampOptions) {
	const slowFrequency = Math.max(0, maxFrequency, minFrequency);
	const fastFrequency = Math.max(0, Math.min(maxFrequency, minFrequency));
	let active = $state(false);
	let ramping = $state(false);
	let rampStartTimeout: ReturnType<typeof setTimeout> | undefined;
	let rampIntervalTimeout: ReturnType<typeof setTimeout> | undefined;
	let rampStartedAt: number | undefined;

	/** Executes an increment and schedules the following one at the current interval. */
	function repeat() {
		if (!active || !canRamp()) {
			reset();
			return;
		}

		ramping = true;
		increment();
		rampIntervalTimeout = setTimeout(repeat, getFrequency());
	}

	/** Returns the delay before the next increment, interpolated across the ramp window. */
	function getFrequency() {
		if (rampUpTime <= 0 || rampStartedAt === undefined) return fastFrequency;

		// Interpolate from the slow interval to the fast interval during the ramp window.
		const progress = Math.min((Date.now() - rampStartedAt) / rampUpTime, 1);
		return slowFrequency - progress * (slowFrequency - fastFrequency);
	}

	/** Stops pending work and returns the ramp to its idle state. */
	function reset() {
		clearTimeout(rampStartTimeout);
		clearTimeout(rampIntervalTimeout);
		rampStartedAt = undefined;
		active = false;
		ramping = false;
	}

	/** Restarts the initial delay and begins a fresh ramp cycle. */
	function start() {
		// Restarting must cancel the previous timers or one pointer could create multiple repeat loops.
		reset();
		active = true;
		rampStartTimeout = setTimeout(
			() => {
				rampStartedAt = Date.now();
				repeat();
			},
			Math.max(0, startDelay)
		);
	}

	return {
		start,
		reset,
		/** Whether a ramp cycle is waiting or repeating. */
		get active() {
			return active;
		},
		/** Whether the initial delay has elapsed and repetition has begun. */
		get ramping() {
			return ramping;
		}
	};
}
