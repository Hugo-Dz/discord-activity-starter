<script lang="ts">
	// Stores
	import { guests } from "$lib/stores/guests";
</script>

<!-- Main container -->
<div class="text-white font-semibold font-sans">
	<!-- User UI -->
	<div class="fixed bottom-8 left-6 flex flex-col space-y-6">
		{#each $guests as guest}
			<div class="flex flex-row justify-center items-center space-x-3">
				<img src="images/sound.svg" alt="Sound icon" height="32" width="32" />
				<p class="px-4 py-2 rounded-full bg-black/50 backdrop-blur-xl">{guest.playerState.getProfile().name}</p>
			</div>
		{/each}
	</div>

	<!-- Controls -->
	<div class="fixed right-6 bottom-6 flex flex-row justify-center items-center space-x-3">
		<img src="images/controls.svg" alt="Controls prompts" class="h-32" />
	</div>
</div>
