import Root, { type RootProps } from "./input-ipv6-root.svelte";
import Segment, { type SegmentProps } from "./input-ipv6-segment.svelte";
import { isValidIPv6, safeParseIPv6, type IPv6Segments } from "./input-ipv6-utils";

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
