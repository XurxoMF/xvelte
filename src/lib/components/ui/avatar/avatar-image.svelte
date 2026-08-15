<script lang="ts" module>
	import { Avatar as AvatarPrimitive } from "bits-ui";

	export type ImageProps = AvatarPrimitive.ImageProps;
</script>

<script lang="ts">
	import { cn } from "$lib/utils";

	let { ref = $bindable(null), class: className, ...restProps }: ImageProps = $props();
</script>

<AvatarPrimitive.Image bind:ref data-slot="avatar-image" class={cn("aspect-square size-full rounded-full object-cover", className)} {...restProps} />
