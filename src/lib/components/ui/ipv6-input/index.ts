import Root, { type RootProps } from "./ipv6-input-root.svelte";
import Segment, { type SegmentProps } from "./ipv6-input-segment.svelte";
import { isValidIPv6, safeParseIPv6, type IPv6Segments } from "./ipv6-input-utils";

export {
	Root,
	Segment,
	//
	type RootProps,
	type SegmentProps,
	type IPv6Segments,
	//
	isValidIPv6,
	safeParseIPv6
};
