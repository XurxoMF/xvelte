import type { RootProps } from "./input-ipv4-root.svelte";
import type { IPv4Segments } from "./input-ipv4-utils";

import Root from "./input-ipv4-root.svelte";
import { isValidIPv4, safeParseIPv4 } from "./input-ipv4-utils";

export {
	Root,
	//
	type RootProps,
	type IPv4Segments,
	//
	isValidIPv4,
	safeParseIPv4
};
