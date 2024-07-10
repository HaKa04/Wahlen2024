<script lang="ts">
	import { getDistrictVotes, getAllowedVoters } from './districtVotes.ts';
	import { calculateSeats } from './calculateSeats.ts';
	import { getProportionalVotes } from './importantFunctions.ts';
	import Switch from './Switch.svelte';
	import * as Math from 'mathjs';
	let districts: DistrictVotes = getDistrictVotes();
	let selectedDistrict: string = Object.keys(districts)[0]; // Standardmäßig der erste Distrikt ausgewählt
	let seatDistribution: { [district: string]: { [party: string]: number } };
	let maxSeats: number;
	let seatDistributionTotal: { [party: string]: number };
	let sliderValue: string = 'on';
	const allowedVoters: { [district: string]: number } = getAllowedVoters();

	// Berechnung des neuen Dictionaries mit dem Verhältnis von votesSum zu allowedVoters
	$: participationRatio = Object.keys(districts).reduce((acc, district) => {
		const votes = Object.entries(districts).reduce((acc, [district, data]) => {
		acc[district] = Object.values(data.votes).reduce((sum, current) => sum + current, 0);
		return acc;
	}, {})[district];
		const allowed = allowedVoters[district] || 0; // Vermeidung von Division durch Null
		acc[district] = allowed > 0 ? votes / allowed : 0; // Verhältnis berechnen
		return acc;
	}, {});

	let proportionalVotes: { [district: string]: { [party: string]: number } } = getProportionalVotes(districts);

	// Reaktive Anweisung zur Berechnung der proportionalen Stimmen
	$: if (sliderValue === 'off') {
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
	function calculateSeatsOnPress() {
		let newSeatDistribution = {};
		for (const districtKey in districts) {
			newSeatDistribution[districtKey] = calculateSeats(districts[districtKey]);
		}
		seatDistribution = newSeatDistribution;

		seatDistributionTotal = fuseSeats(seatDistribution);

		// Aktualisieren von maxSeats basierend auf dem neuen seatDistribution
		maxSeats = Math.max(...Object.values(seatDistribution).flatMap(Object.values));
	}

	function fuseSeats(seatDistribution) {
		let seatDistributionTotal = {};
		for (const districtKey in seatDistribution) {
			for (const partyKey in seatDistribution[districtKey]) {
				if (seatDistributionTotal[partyKey] === undefined) {
					seatDistributionTotal[partyKey] = 0;
				}
				seatDistributionTotal[partyKey] += seatDistribution[districtKey][partyKey];
			}
		}
		return seatDistributionTotal;
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
								bind:value={districts[selectedDistrict].votes[party]}
								min="0"
								max="100"
								step="1"
							/>
							<input
								type="number"
								bind:value={districts[selectedDistrict].votes[party]}
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
		<button type="button" on:click={calculateSeatsOnPress}>Sitze berechnen</button>
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
