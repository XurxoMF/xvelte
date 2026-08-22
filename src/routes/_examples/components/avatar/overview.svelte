<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar";
	import * as Typography from "$lib/components/ui/typography";
</script>

<div class="flex items-center justify-center">
	<div class="flex items-center gap-3">
		<Avatar.Root>
			<Avatar.Fallback>AL</Avatar.Fallback>
		</Avatar.Root>

		<div>
			<Typography.P>Ada Lovelace</Typography.P>
			<Typography.P class="ltext-muted-foreground">Mathematician</Typography.P>
		</div>
	</div>
</div>
