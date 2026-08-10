export type UseRampOptions = {
	/** The function to call to increment the value */
	increment: () => void;
	/**
	 * The maximum amount of time it should take to increment the value by 1 in milliseconds
	 * @default 200
	 */
	maxFrequency?: number;
	/**
	 * The minimum amount of time it should take to increment the value by 1 in milliseconds
	 * @default 25
	 */
	minFrequency?: number;
	/**
	 * The amount of time to wait in milliseconds before starting to ramp up.
	 * @default 100
	 */
	startDelay?: number;
	/**
	 * The amount of time it should take to ramp up to the minimum frequency
	 * @default 2500
	 */
	rampUpTime?: number;
	/** A function to determine whether the value can be incremented. When false the ramp will be reset. */
	canRamp: () => boolean;
};

export function useRamp({ increment, maxFrequency = 200, minFrequency = 25, startDelay = 100, rampUpTime = 2500, canRamp }: UseRampOptions) {
	const slowFrequency = Math.max(0, maxFrequency, minFrequency);
	const fastFrequency = Math.max(0, Math.min(maxFrequency, minFrequency));
	let active = $state(false);
	let ramping = $state(false);
	let rampStartTimeout: ReturnType<typeof setTimeout> | undefined;
	let rampIntervalTimeout: ReturnType<typeof setTimeout> | undefined;
	let rampStartedAt: number | undefined;

	function repeat() {
		if (!active || !canRamp()) {
			reset();
			return;
		}

		ramping = true;
		increment();
		rampIntervalTimeout = setTimeout(repeat, getFrequency());
	}

	function getFrequency() {
		if (rampUpTime <= 0 || rampStartedAt === undefined) return fastFrequency;

		// Interpolate from the slow interval to the fast interval during the ramp window.
		const progress = Math.min((Date.now() - rampStartedAt) / rampUpTime, 1);
		return slowFrequency - progress * (slowFrequency - fastFrequency);
	}

	function reset() {
		clearTimeout(rampStartTimeout);
		clearTimeout(rampIntervalTimeout);
		rampStartedAt = undefined;
		active = false;
		ramping = false;
	}

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
		get active() {
			return active;
		},
		get ramping() {
			return ramping;
		}
	};
}
