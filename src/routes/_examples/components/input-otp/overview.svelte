<script lang="ts">
	import * as InputOTP from "$lib/components/ui/input-otp";
	import * as Label from "$lib/components/ui/label";

	let code = $state("");
</script>

<div class="grid gap-2">
	<Label.Root for="verification-code">Verification code</Label.Root>

	<InputOTP.Root
		inputId="verification-code"
		name="verificationCode"
		maxlength={6}
		pattern="^[0-9]+$"
		inputmode="numeric"
		autocomplete="one-time-code"
		bind:value={code}
	>
		{#snippet children({ cells })}
			<InputOTP.Group>
				{#each cells as cell (cell)}
					<InputOTP.Slot {cell} />
				{/each}
			</InputOTP.Group>
		{/snippet}
	</InputOTP.Root>
</div>
