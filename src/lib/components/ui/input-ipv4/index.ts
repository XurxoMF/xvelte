import Root, { type RootProps } from "./input-ipv4-root.svelte";
import Segment, { type SegmentProps } from "./input-ipv4-segment.svelte";
import { isValidIPv4, safeParseIPv4, type IPv4Segments } from "./input-ipv4-utils";

export {
	Root,
	Segment,
	//
	type RootProps,
	type SegmentProps,
	type IPv4Segments,
	//
	isValidIPv4,
	safeParseIPv4
};
