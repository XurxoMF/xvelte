<script lang="ts">
	import { AlertErrorIcon, CloseIcon, FileIcon } from "$lib/icons";

	import * as Attachment from "$lib/components/ui/attachment";
	import * as Spinner from "$lib/components/ui/spinner";

	const files = [
		{ name: "briefing-notes.pdf", metadata: "PDF · 1.4 MB" },
		{ name: "customers.csv", metadata: "CSV · 18 KB" },
		{ name: "message-renderer.ts", metadata: "TypeScript · 12 KB" }
	];
</script>

<div class="mx-auto flex w-full max-w-sm flex-col gap-3">
	<Attachment.Group class="w-full" role="region" aria-label="Uploaded files" tabindex={0}>
		{#each files as file (file.name)}
			<Attachment.Root class="w-64">
				<Attachment.Media>
					<FileIcon />
				</Attachment.Media>

				<Attachment.Content>
					<Attachment.Title>{file.name}</Attachment.Title>
					<Attachment.Description>{file.metadata}</Attachment.Description>
				</Attachment.Content>

				<Attachment.Actions>
					<Attachment.Action aria-label={`Remove ${file.name}`}>
						<CloseIcon />
					</Attachment.Action>
				</Attachment.Actions>
			</Attachment.Root>
		{/each}
	</Attachment.Group>

	<Attachment.Root state="uploading" class="w-full">
		<Attachment.Media>
			<Spinner.Root />
		</Attachment.Media>

		<Attachment.Content>
			<Attachment.Title>sales-dashboard.pdf</Attachment.Title>
			<Attachment.Description>Uploading · 64%</Attachment.Description>
		</Attachment.Content>

		<Attachment.Actions>
			<Attachment.Action aria-label="Cancel sales-dashboard.pdf upload">
				<CloseIcon />
			</Attachment.Action>
		</Attachment.Actions>
	</Attachment.Root>

	<Attachment.Root state="error" class="w-full">
		<Attachment.Media>
			<AlertErrorIcon />
		</Attachment.Media>

		<Attachment.Content>
			<Attachment.Title>financial-model.xlsx</Attachment.Title>
			<Attachment.Description>Upload failed. Try again.</Attachment.Description>
		</Attachment.Content>
	</Attachment.Root>
</div>
