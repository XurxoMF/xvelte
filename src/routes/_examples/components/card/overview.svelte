<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import * as Typography from "$lib/components/ui/typography";
	import * as Button from "$lib/components/ui/button";
</script>

<div class="flex items-center justify-center">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title>Project activity</Card.Title>
			<Card.Description>Changes made during the last seven days.</Card.Description>
		</Card.Header>

		<Card.Content>
			<Typography.P>12 commits, 4 reviews, and 2 deployments.</Typography.P>
		</Card.Content>

		<Card.Footer>
			<Button.Root onclick={() => navigation.navigate("https://github.com/XurxoMF/xvelte")} class="w-full">Go to GitHub</Button.Root>
		</Card.Footer>
	</Card.Root>
</div>
