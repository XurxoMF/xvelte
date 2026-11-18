<script lang="ts">
	import { page } from "$app/state";

	import ErrorContent from "./error-content.svelte";
</script>

<ErrorContent status={page.status} />
