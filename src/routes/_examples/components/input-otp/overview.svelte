<script lang="ts">
	import * as Field from "$lib/components/ui/field";
	import * as InputOTP from "$lib/components/ui/input-otp";

	let code = $state("");
</script>

<Field.Field>
	<Field.Label for="verification-code">Verification code</Field.Label>

	<InputOTP.Root
		inputId="verification-code"
		name="verificationCode"
		maxlength={6}
		pattern="^[0-9]+$"
		inputmode="numeric"
		autocomplete="one-time-code"
		bind:value={code}
		aria-describedby="verification-code-description"
	>
		{#snippet children({ cells })}
			<InputOTP.Group>
				{#each cells as cell (cell)}
					<InputOTP.Slot {cell} />
				{/each}
			</InputOTP.Group>
		{/snippet}
	</InputOTP.Root>

	<Field.Description id="verification-code-description">Enter the six-digit code sent to your device.</Field.Description>
</Field.Field>
