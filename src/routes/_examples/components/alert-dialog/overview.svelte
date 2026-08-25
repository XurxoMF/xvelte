<script lang="ts">
	import { cn } from "$lib/utils";

	import * as Button from "$lib/components/ui/button";
	import * as AlertDialog from "$lib/components/ui/alert-dialog";
</script>

<div class="flex items-center justify-center">
	<AlertDialog.Root>
		<AlertDialog.Trigger class={cn(Button.rootVariants({ variant: "outline" }))}>Delete project</AlertDialog.Trigger>

		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Delete this project?</AlertDialog.Title>
				<AlertDialog.Description>This permanently removes the project and its deployment history.</AlertDialog.Description>
			</AlertDialog.Header>

			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action variant="danger">Delete project</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
