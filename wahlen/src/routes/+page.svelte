<script lang="ts">
	import { getDistrictVotes, getDefaultFixedParties } from './districtVotes.ts';
	import { calculateSeats } from './calculateSeats.ts';
	import { getProportionalVotes, getParticipationRatio, getSumOfParties, getAllowedVoters} from './importantFunctions.ts';
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
	let sliderValue: boolean = true;
	let participationRatio: {[district:string]: number} = getParticipationRatio(districts);
	let proportionalVotes: { [district: string]: { [party: string]: number } } =
		getProportionalVotes(districts);
	let fixedParties:{[district:string]:{[party:string]:boolean}} = getDefaultFixedParties();

	// Berechnung der Sitze
	$: [seatDistribution, seatDistributionTotal] = calculateSeatsTotal(districts);

	// Logik für den Slider, um zwischen Prozent- und Absolutmodus zu wechseln
	$: if (!sliderValue) {
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
		districts = getDistrictVotes();
		proportionalVotes = getProportionalVotes(districts);
		participationRatio = getParticipationRatio(districts);

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

	function updateAbsoluteVotes(proportionalVoteDistricts:{[party:string]:number}, selectedDistrict:string) {
		// Iterieren über das Objekt und Aktualisieren der Werte
		Object.keys(districts[selectedDistrict].votes).forEach(key => {
  			districts[selectedDistrict].votes[key] = Math.round(proportionalVoteDistricts[key] * participationRatio[selectedDistrict] * getAllowedVoters()[selectedDistrict]);
});
	}

	function handlePercentageChanges(proportionalVoteDistricts: {[party: string]: number}, party: string, fixedParties: {[party: string]: boolean}) {
    // Hier können Sie Logik hinzufügen, um zu verarbeiten, was passiert, wenn sich ein Wert ändert
    let sumFixedParties: number = 0;
    Object.keys(proportionalVoteDistricts).forEach(tempParty => {
        if (fixedParties[tempParty]) {
            sumFixedParties += proportionalVoteDistricts[tempParty] ?? 0;
        }
    });

    if (!fixedParties[party]) {
        // Wert der Partei zur Summe hinzufügen
        sumFixedParties += proportionalVoteDistricts[party] ?? 0;
    }

    // Wenn die Summe größer als 1 ist, das was über 1 ist von proportionalVoteDistricts an der Stelle von party abziehen
    if (sumFixedParties > 1) {
        let excess = sumFixedParties - 1; // Berechnung des Überschusses
        proportionalVoteDistricts[party] -= excess; // Überschuss von der Partei abziehen
        sumFixedParties = 1; // Summe auf 1 setzen
    }

    let leftOver: number = 1 - sumFixedParties;
    let movableParties = Object.keys(proportionalVoteDistricts).filter(tempParty => !fixedParties[tempParty] && tempParty !== party);
    let sumMovableParties: number = 0;
    movableParties.forEach(tempParty => {
        sumMovableParties += proportionalVoteDistricts[tempParty];
    });
    let factor: number = leftOver / sumMovableParties;
    for (let i = 0; i < movableParties.length; i++) {
        proportionalVoteDistricts[movableParties[i]] *= factor;
    }
    updateAbsoluteVotes(proportionalVoteDistricts, selectedDistrict);
    return proportionalVoteDistricts;
}

function handleParticipationRatioChange(selectedDistrict){
	Object.keys(districts[selectedDistrict].votes).forEach(key => {
  			districts[selectedDistrict].votes[key] = Math.round(proportionalVotes[selectedDistrict][key] * participationRatio[selectedDistrict] * getAllowedVoters()[selectedDistrict]);
});
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
					{#if sliderValue}
						<label>
							<input
								type="checkbox"
								name="befestigen"
								bind:checked={fixedParties[selectedDistrict][party]}
							/>
							<input
								type="range"
								bind:value={proportionalVotes[selectedDistrict][party]}
								on:input={() => handlePercentageChanges(proportionalVotes[selectedDistrict], party, fixedParties[selectedDistrict])}
								min="0"
								max="1"
								step="0.01"
							/>
							<input
								type="number"
								bind:value={proportionalVotes[selectedDistrict][party]}
								on:input={() => handlePercentageChanges(proportionalVotes[selectedDistrict], party, fixedParties[selectedDistrict])}
								min="0"
								max=1
								step="0.01"
							/>
						</label>
					{:else}
						<label>
							<input
								type="number"
								bind:value={districts[selectedDistrict].votes[party]}
								min="0"
								max="150000"
								step="500"
							/>
							<input
								type="range"
								bind:value={districts[selectedDistrict].votes[party]}
								min="0"
								max="150000"
								step="500"
							/>
						</label>
					{/if}
				{/each}
			</ul>
		{/if}
		<button type="button" on:click={resetDistrictVotes}>Reset</button>
		{#if sliderValue}
			<label>
				<input
					type="number"
					bind:value={participationRatio[selectedDistrict]}
					on:input={() => handleParticipationRatioChange(selectedDistrict)}
					min="0"
					max="1"
					step="0.01"
				/>
				<input
					type="range"
					bind:value={participationRatio[selectedDistrict]}
					on:input={() => handleParticipationRatioChange(selectedDistrict)}
					min="0"
					max="1"
					step="0.01"
				/>
			</label>
		{:else}
			<p>Wahlbeteiligung: {(participationRatio[selectedDistrict] * 100).toFixed(1)}%</p>
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
