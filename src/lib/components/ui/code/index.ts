import CopyButton, { type CopyButtonProps } from "./code-copy-button.svelte";
import Overflow from "./code-overflow.svelte";
import Root from "./code-root.svelte";
import type { CodeOverflowProps, CodeRootProps } from "./types";

export { Root, CopyButton, Overflow, type CodeRootProps as RootProps, type CopyButtonProps, type CodeOverflowProps as OverflowProps };
export { codeVariants, type CodeVariant } from "./code-variants";
