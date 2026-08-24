<script lang="ts">
	import { AlertErrorIcon, AlertInfoIcon, AlertSuccessIcon, AlertWarningIcon, CircleIcon, LoaderIcon } from "$lib/icons";

	import * as Button from "$lib/components/ui/button";
	import * as Sonner from "$lib/components/ui/sonner";
	import * as Typography from "$lib/components/ui/typography";
</script>

<div class="flex w-full flex-col gap-4">
	<div>
		<Typography.H3>Toast variants</Typography.H3>
		<Typography.P class="text-muted-foreground">Trigger each notification type using the globally mounted toaster.</Typography.P>
	</div>

	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
		<Button.Root variant="outline" onclick={() => Sonner.toast("Calendar updated", { description: "Your meeting was moved to tomorrow at 10:00." })}>
			<CircleIcon data-icon="inline-start" />
			Normal
		</Button.Root>

		<Button.Root
			variant="success"
			onclick={() => Sonner.toast.success("Changes saved", { description: "Your workspace preferences are now up to date." })}
		>
			<AlertSuccessIcon data-icon="inline-start" />
			Success
		</Button.Root>

		<Button.Root
			variant="info"
			onclick={() => Sonner.toast.info("New version available", { description: "Refresh when you are ready to use the latest features." })}
		>
			<AlertInfoIcon data-icon="inline-start" />
			Info
		</Button.Root>

		<Button.Root
			variant="warning"
			onclick={() => Sonner.toast.warning("Storage almost full", { description: "Remove unused files to keep uploads working." })}
		>
			<AlertWarningIcon data-icon="inline-start" />
			Warning
		</Button.Root>

		<Button.Root variant="danger" onclick={() => Sonner.toast.error("Could not publish", { description: "Check your connection and try again." })}>
			<AlertErrorIcon data-icon="inline-start" />
			Error
		</Button.Root>

		<Button.Root
			variant="secondary"
			onclick={() => Sonner.toast.loading("Uploading files…", { description: "This toast closes automatically.", duration: 4000 })}
		>
			<LoaderIcon class="animate-spin" data-icon="inline-start" />
			Loading
		</Button.Root>
	</div>
</div>
