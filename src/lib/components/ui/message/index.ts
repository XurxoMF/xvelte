import type { AvatarProps } from "./message-avatar.svelte";
import type { ContentProps } from "./message-content.svelte";
import type { FooterProps } from "./message-footer.svelte";
import type { GroupProps } from "./message-group.svelte";
import type { HeaderProps } from "./message-header.svelte";
import type { RootAlignments, RootProps } from "./message-root.svelte";

import Avatar from "./message-avatar.svelte";
import Content from "./message-content.svelte";
import Footer from "./message-footer.svelte";
import Group from "./message-group.svelte";
import Header from "./message-header.svelte";
import Root from "./message-root.svelte";

export {
	Root,
	Group,
	Avatar,
	Content,
	Header,
	Footer,
	//
	type RootProps,
	type RootAlignments,
	type GroupProps,
	type AvatarProps,
	type ContentProps,
	type HeaderProps,
	type FooterProps
};
