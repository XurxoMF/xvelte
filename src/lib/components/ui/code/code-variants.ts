import { tv, type VariantProps } from "tailwind-variants";

export const codeVariants = tv({
	base: "not-prose relative h-full overflow-auto rounded-lg border",
	variants: {
		variant: {
			default: "border-border bg-card",
			secondary: "border-transparent bg-secondary/50"
		}
	}
});

export type CodeVariant = VariantProps<typeof codeVariants>["variant"];
