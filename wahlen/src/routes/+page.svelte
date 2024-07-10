<script lang="ts">
	import { getDistrictVotes } from './districtVotes.ts';
	import { calculateSeats } from './calculateSeats.ts';
	import { getProportionalVotes, getParticipationRatio } from './importantFunctions.ts';
	import Switch from './Switch.svelte';
	import * as Math from 'mathjs';

	interface VoteCounts {
		[party: string]: number;
	}
	interface DistrictVotes {
	[key: string]: {
		votes: VoteCounts;
		total_seats: number;
	};
	}

	let districts: DistrictVotes = getDistrictVotes();
	let selectedDistrict: string = Object.keys(districts)[0]; // Standardmäßig der erste Distrikt ausgewählt
	let seatDistribution: {[district:string]:{[party:string]: number}};
	let seatDistributionTotal: {[party:string]: number};
	let sliderValue: string = 'on';
	let participationRatio: {[district:string]: number} = getParticipationRatio(districts);
	let proportionalVotes: { [district: string]: { [party: string]: number } } =
		getProportionalVotes(districts);

	// Berechnung der Sitze
	$: [seatDistribution, seatDistributionTotal] = calculateSeatsTotal(districts);

	// Logik für den Slider, um zwischen Prozent- und Absolutmodus zu wechseln
	$: if (sliderValue === 'off') {
		participationRatio = getParticipationRatio(districts);
		proportionalVotes = getProportionalVotes(districts);
	}

	// Funktion, um die Stimmen des ausgewählten Distrikts zu holen
	function getVotes(district) {
		return districts[district].votes;
	}

	// Funktion, die beim Einreichen des Formulars aufgerufen wird
	function handleSubmit() {
		// Logik, die ausgeführt werden soll, wenn das Formular eingereicht wird
		console.log(`Ausgewählter Distrikt: ${selectedDistrict}`);
	}
	// Funktion, um den ausgewählten Distrikt zurückzusetzen
	function resetDistrictVotes() {
		// Annahme: getDistrictVotes() gibt die ursprünglichen Werte zurück
		const originalVotes: DistrictVotes = getDistrictVotes();

		// Iterieren über alle Distrikte und Zurücksetzen der Stimmen
		Object.keys(districts).forEach((district) => {
			districts[district].votes = originalVotes[district].votes;
		});
	}

	// Funktion, um die Sitze zu berechnen
	function calculateSeatsTotal(districts: DistrictVotes) {
		let newSeatDistribution:{[district:string]:{[party:string]: number}} = {};
		for (const districtKey in districts) {
			newSeatDistribution[districtKey] = calculateSeats(districts[districtKey]);
		}
		let newSeatDistributionTotal = fuseSeats(newSeatDistribution);

		return [newSeatDistribution, newSeatDistributionTotal];
	}

	function fuseSeats(newSeatDistribution:{[district:string]:{[party:string]: number}}) {
		let newSeatDistributionTotal:{[party:string]: number} = {};
		for (const districtKey in newSeatDistribution) {
			for (const partyKey in newSeatDistribution[districtKey]) {
				if (newSeatDistributionTotal[partyKey] === undefined) {
					newSeatDistributionTotal[partyKey] = 0;
				}
				newSeatDistributionTotal[partyKey] += newSeatDistribution[districtKey][partyKey];
			}
		}
		return newSeatDistributionTotal;
	}
</script>

<h1>Grossratswahlen 2024 Simulation Sitzzuteilung Basel-Stadt</h1>
<h2>Ausgewählter Distrikt: {selectedDistrict}</h2>
<div class="container">
	<div class="left-side">
		<form on:submit|preventDefault={handleSubmit}>
			<select
				bind:value={selectedDistrict}
				on:change={() => {
					/* Logik, falls benötigt */
				}}
			>
				{#each Object.keys(districts) as district}
					<option value={district}>{district}</option>
				{/each}
			</select>
		</form>

		<!-- Beispiel, um die Stimmen des ausgewählten Distrikts anzuzeigen -->
		{#if selectedDistrict}
			<Switch bind:value={sliderValue} label="Prozent Modus" fontSize={24} design="slider" />
			<h3>Stimmen:</h3>
			<ul>
				{#each Object.entries(getVotes(selectedDistrict)) as [party, votes]}
					<li>{party}</li>
					{#if sliderValue === 'on'}
						<label>
							<input
								type="range"
								bind:value={proportionalVotes[selectedDistrict][party]}
								min="0"
								max="100"
								step="1"
							/>
							<input
								type="number"
								bind:value={proportionalVotes[selectedDistrict][party]}
								min="0"
								max="100"
								step="1"
							/>
						</label>
					{:else}
						<label>
							<input
								type="number"
								bind:value={districts[selectedDistrict].votes[party]}
								min="0"
								max="1000000"
								step="500"
							/>
							<input
								type="range"
								bind:value={districts[selectedDistrict].votes[party]}
								min="0"
								max="1000000"
								step="500"
							/>
						</label>
					{/if}
				{/each}
			</ul>
		{/if}
		<button type="button" on:click={resetDistrictVotes}>Reset</button>
		<p>Wahlbeteiligung: {(participationRatio[selectedDistrict] * 100).toFixed(1)}%</p>
		{#if Object.keys(proportionalVotes).length > 0}
			<p>{proportionalVotes[selectedDistrict].FDP}</p>
		{/if}
	</div>

	<div class="right-side">
		{#if seatDistribution}
			<h3>Sitzzuteilung im Distrikt {selectedDistrict}:</h3>
			<ul>
				{#each Object.entries(seatDistribution[selectedDistrict]) as [party, seats]}
					<li>{party}: {seats}</li>
				{/each}
			</ul>
			<h3>Sitzzuteilung alle zusammen:</h3>
			<ul>
				{#each Object.entries(seatDistributionTotal) as [party, seats]}
					<li>{party}: {seats}</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.container {
		display: flex;
		justify-content: space-between;
	}

	.left-side,
	.right-side {
		flex: 1;
	}
</style>
