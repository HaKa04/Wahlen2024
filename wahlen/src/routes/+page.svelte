<script lang="ts">
	import { getDistrictVotes, getDefaultFixedParties } from './districtVotes.ts';
	import { calculateSeatsTotal, calculateSeatsDistricts } from './calculateSeats.ts';
	import {
		getProportionalVotes,
		getParticipationRatio,
		getDefaultGrueneToBastaRatiosLocal,
		changeParticipationRatioChange,
		changePercentageChanges,
		changeGrueneBastaSplitDistricts,
		changeGrueneBastaSplitProportion,
		changeGrueneBastaFuseDistricts,
		changeGrueneBastaFuseProportion
	} from './importantFunctions.ts';
	import {getVotesforExtraSeatsTotal,
		getVotesforExtraSeatsTotalAllDistricts,
		getVotesforMinusSeatsTotalAllDistricts,
		getVotesforMinusSeatsTotal
	} from './statistics.ts';
	import Switch from './Switch.svelte';
	import * as Math from 'mathjs';
	import { get } from 'svelte/store';

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
	let seatDistribution: { [district: string]: { [party: string]: number } };
	let seatDistributionTotal: { [party: string]: number };
	let sliderValuePercentMode: boolean = true;
	let switchValueGBBasta: boolean = false;
	let participationRatio: { [district: string]: number } = getParticipationRatio(districts);
	let proportionalVotes: { [district: string]: { [party: string]: number } } =
		getProportionalVotes(districts);
	let fixedParties: { [district: string]: { [party: string]: boolean } } = getDefaultFixedParties();
	let RatioGrueneToGrueneAndBastaLocal: { [district: string]: number } = getDefaultGrueneToBastaRatiosLocal();
	let extraSeatsTotal: {[districts:string]:{ [party: string]: number }} = getVotesforExtraSeatsTotalAllDistricts(districts);
	let minusSeatsTotal: {[districts:string]:{ [party: string]: number }} = getVotesforMinusSeatsTotalAllDistricts(districts);
	//let extraSeatsTotal: {[districts:string]:{ [party: string]: number }} = {Grossbasel_Ost: {FDP: 0,LDP: 0,EVP: 0,SP: 0,CVP: 0,GLP: 0,SVP: 0,KL: 0,GB: 0,GP: 0,BA: 0},Grossbasel_West: {FDP: 0,LDP: 0,EVP: 0,SP: 0,CVP: 0,GLP: 0,SVP: 0,GB: 0,GP: 0,BA: 0},Kleinbasel: {FDP: 0,LDP: 0,EVP: 0,SP: 0,CVP: 0,GLP: 0,SVP: 0,FUK: 0,VA: 0,KL: 0,Andere: 0,GB: 0,GP: 0,BA: 0},Riehen: {FDP: 0,LDP: 0,EVP: 0,SP: 0,CVP: 0,GLP: 0,SVP: 0,GB: 0,GP: 0,BA: 0},Bettingen: {BDV: 0,AB: 0}};

	// Berechnung der Sitze
	$: seatDistribution = calculateSeatsDistricts(districts);
	$: seatDistributionTotal = calculateSeatsTotal(seatDistribution);
	$: extraSeatsTotal[selectedDistrict] = getVotesforExtraSeatsTotal(districts[selectedDistrict]);
	$: minusSeatsTotal[selectedDistrict] = getVotesforMinusSeatsTotal(districts[selectedDistrict]);

	// Funktion, um den ausgewählten Distrikt zurückzusetzen
	function resetDistrictVotes() {
		// Annahme: getDistrictVotes() gibt die ursprünglichen Werte zurück
		districts = getDistrictVotes();
		proportionalVotes = getProportionalVotes(districts);
		participationRatio = getParticipationRatio(districts);
		RatioGrueneToGrueneAndBastaLocal = getDefaultGrueneToBastaRatiosLocal();
		handleGrueneBastaSplit(switchValueGBBasta);
	}

	// Logik für den Slider, um zwischen Prozent- und Absolutmodus zu wechseln
	function handleAbsolutVoteChange() {
		participationRatio = getParticipationRatio(districts);
		proportionalVotes = getProportionalVotes(districts);
		handleVoteChangeForGrueneBastaRatio();
	}

	function handlePercentageChanges(
		proportionalVoteDistricts: { [party: string]: number },
		party: string,
		fixedParties: { [party: string]: boolean }
	) {
		proportionalVoteDistricts = changePercentageChanges(
			proportionalVoteDistricts,
			party,
			fixedParties
		);
		districts[selectedDistrict].votes = changeParticipationRatioChange(
			proportionalVoteDistricts,
			participationRatio[selectedDistrict],
			selectedDistrict
		);
		handleVoteChangeForGrueneBastaRatio();
	}

	function handleVoteChangeForGrueneBastaRatio() {
		if (switchValueGBBasta) {
			let absoluteGruene: number;
			let absoluteBasta: number;
			if (!sliderValuePercentMode) {
				absoluteGruene = districts[selectedDistrict].votes.GP;
				absoluteBasta = districts[selectedDistrict].votes.BA;
			} else {
				absoluteGruene = proportionalVotes[selectedDistrict].GP;
				absoluteBasta = proportionalVotes[selectedDistrict].BA;
			}
			RatioGrueneToGrueneAndBastaLocal[selectedDistrict] = absoluteGruene / (absoluteGruene + absoluteBasta);
		}
	}

	function handleParticipationRatioChange(selectedDistrict: string) {
		districts[selectedDistrict].votes = changeParticipationRatioChange(
			proportionalVotes[selectedDistrict],
			participationRatio[selectedDistrict],
			selectedDistrict
		);
	}

	function handleGrueneBastaSplit(switchValueGBBasta: boolean) {
		if (switchValueGBBasta) {
			districts = changeGrueneBastaSplitDistricts(districts, RatioGrueneToGrueneAndBastaLocal);
			proportionalVotes = changeGrueneBastaSplitProportion(
				proportionalVotes,
				RatioGrueneToGrueneAndBastaLocal
			);
		} else {
			districts = changeGrueneBastaFuseDistricts(districts);
			proportionalVotes = changeGrueneBastaFuseProportion(proportionalVotes);
		}
	}
	function handleGrueneToBastaRatioChange() {
		if (switchValueGBBasta) {
			districts = changeGrueneBastaFuseDistricts(districts);
			districts = changeGrueneBastaSplitDistricts(districts, RatioGrueneToGrueneAndBastaLocal);
			proportionalVotes = changeGrueneBastaFuseProportion(proportionalVotes);
			proportionalVotes = changeGrueneBastaSplitProportion(
				proportionalVotes,
				RatioGrueneToGrueneAndBastaLocal
			);
		}
	}
	function handleGrüneToBastaRatioTransmitChange() {
		Object.keys(RatioGrueneToGrueneAndBastaLocal).forEach((district) => {
			RatioGrueneToGrueneAndBastaLocal[district] = RatioGrueneToGrueneAndBastaLocal[selectedDistrict];
		});
		handleGrueneToBastaRatioChange();
	}
</script>

<h1>Grossratswahlen 2024 Simulation Sitzzuteilung Basel-Stadt</h1>
<h2>Ausgewählter Distrikt: {selectedDistrict}</h2>
<div class="container">
	<div class="left-side">
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
		<!-- Beispiel, um die Stimmen des ausgewählten Distrikts anzuzeigen -->
		{#if selectedDistrict}
			<Switch
				bind:value={sliderValuePercentMode}
				label="Prozent Modus"
				fontSize={24}
				design="slider"
			/>
			<label>
				<input
					type="checkbox"
					name="Grüne und Basta aufteilen"
					bind:checked={switchValueGBBasta}
					on:change={() => {
						handleGrueneBastaSplit(switchValueGBBasta);
					}}
				/>
				Grüne und Basta aufteilen
			</label>
			{#if selectedDistrict != 'Bettingen'}
			{#if switchValueGBBasta}
			<div>
			<label>
				<input
					type="number"
					bind:value={RatioGrueneToGrueneAndBastaLocal[selectedDistrict]}
					on:input={() => handleGrueneToBastaRatioChange()}
					min="0"
					max="1"
					step="0.01"
				/>
				<input
					type="range"
					bind:value={RatioGrueneToGrueneAndBastaLocal[selectedDistrict]}
					on:input={() => handleGrueneToBastaRatioChange()}
					min="0"
					max="1"
					step="0.01"
				/>
				Wahlkreis {selectedDistrict}
			</label>
			</div>
			<button on:click={handleGrüneToBastaRatioTransmitChange}>
			Verhältnis auf alle Wahlkreise übertragen
			</button>
			{/if}
			{/if}
			<h3>Stimmen:</h3>
			<ul>
				{#each Object.entries(districts[selectedDistrict].votes) as [party, votes]}
					<li>{party}</li>
					{#if sliderValuePercentMode}
						<label>
							<input
								type="range"
								bind:value={proportionalVotes[selectedDistrict][party]}
								on:input={() =>
									handlePercentageChanges(
										proportionalVotes[selectedDistrict],
										party,
										fixedParties[selectedDistrict]
									)}
								min="0"
								max="1"
								step="0.01"
							/>
							<input
								type="number"
								bind:value={proportionalVotes[selectedDistrict][party]}
								on:input={() =>
									handlePercentageChanges(
										proportionalVotes[selectedDistrict],
										party,
										fixedParties[selectedDistrict]
									)}
								min="0"
								max="1"
								step="0.01"
							/>
							<input
								type="checkbox"
								name="befestigen"
								bind:checked={fixedParties[selectedDistrict][party]}
							/>
							Befestigen
						</label>
					{:else}
						<label>
							<input
								type="number"
								bind:value={districts[selectedDistrict].votes[party]}
								on:input={() => handleAbsolutVoteChange()}
								min="0"
								max="150000"
								step="500"
							/>
							<input
								type="range"
								bind:value={districts[selectedDistrict].votes[party]}
								on:input={() => handleAbsolutVoteChange()}
								min="0"
								max="150000"
								step="500"
							/>
							<span style="color: green;">
							{extraSeatsTotal[selectedDistrict][party]}
							</span>
							<span style="color: red;">
							{minusSeatsTotal[selectedDistrict][party]}
							</span>
						</label>
					{/if}
				{/each}
			</ul>
		{/if}
		<button type="button" on:click={resetDistrictVotes}>Reset</button>
		{#if sliderValuePercentMode}
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
