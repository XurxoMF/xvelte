<script lang="ts">
	import { rootVariants as buttonVariants } from "$lib/components/ui/button";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger class={buttonVariants({ variant: "outline" })}>Delete project</AlertDialog.Trigger>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete this project?</AlertDialog.Title>
			<AlertDialog.Description>This permanently removes the project and its deployment history.</AlertDialog.Description>
		</AlertDialog.Header>

		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action variant="destructive">Delete project</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
