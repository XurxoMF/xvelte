<script lang="ts" module>
	import { PinInput as InputOTPPrimitive } from "bits-ui";

	export type RootProps = InputOTPPrimitive.RootProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, value = $bindable(""), ...restProps }: RootProps = $props();
</script>

<InputOTPPrimitive.Root
	bind:ref
	bind:value
	data-slot="input-otp"
	spellcheck={false}
	class={cn("flex items-center gap-2 disabled:cursor-not-allowed has-disabled:opacity-50", className)}
	{...restProps}
/>
