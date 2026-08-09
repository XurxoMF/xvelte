<script lang="ts" module>
	import type { HTMLImgAttributes } from "svelte/elements";
	export type TriggerProps = HTMLImgAttributes;
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { cn } from "$lib/utils";
	import { getImageZoomContext } from "./image-zoom-context";

	let { src, alt, class: className, ...restProps }: TriggerProps = $props();

	const { registerImage, openImage } = getImageZoomContext();

	let myIndex: number;

	onMount(() => {
		if (!src) {
			console.warn("ImageZoom.Trigger requires a 'src' prop.");
			return;
		}
		myIndex = registerImage({ src, alt: alt || "" });
	});

	function handleOpenZoom() {
		if (myIndex !== undefined) {
			openImage(myIndex);
		}
	}
</script>

<img
	data-slot="image-zoom-trigger"
	src={src || ""}
	alt={alt || ""}
	class={cn("cursor-zoom-in transition-transform duration-200 hover:scale-[1.01] hover:brightness-90", className)}
	onclick={handleOpenZoom}
	{...restProps}
/>
