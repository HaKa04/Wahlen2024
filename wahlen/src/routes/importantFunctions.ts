import { re } from "mathjs";

export function getAllowedVoters () {
	let allowedVoters: {[district:string]:number} = {
		Grossbasel_Ost: 762538,
		Grossbasel_West: 1226915,
		Kleinbasel: 603577,
		Riehen: 156688,
		Bettingen: 1014
	};
	return allowedVoters;
};
export function getSumOfParties(district:{[party:string]:number}, Parties:string[]) {
	let sum = 0;
	for (const [party, votes] of Object.entries(district)) {
	  if (Parties.includes(party)) {
		sum += votes;
	  }
	}
	return sum;
  }
export function getProportionalVotes(districts) {
	let votesSum = Object.entries(districts).reduce((acc, [district, data]) => {
		acc[district] = Object.values(data.votes).reduce((sum, current) => sum + current, 0);
		return acc;
	}, {});
	return Object.entries(districts).reduce((acc, [district, data]) => {
		const districtTotalVotes = votesSum[district];
		const partyVotes = data.votes;
		const proportions = Object.keys(partyVotes).reduce((partyAcc, party) => {
			const votes = partyVotes[party];
			// Berechnung der Proportion der Stimmen zur Gesamtstimmenzahl des Distrikts
			partyAcc[party] = districtTotalVotes > 0 ? votes / districtTotalVotes : 0;
			return partyAcc;
		}, {});
		acc[district] = proportions;
		return acc;
	}, {});
}

export function getParticipationRatio(districts) {
	const allowedVoters = getAllowedVoters();
	return Object.keys(districts).reduce((acc: { [district: string]: number }, district) => {
		const votes = Object.entries(districts).reduce(
			(
				acc: { [district: string]: number },
				[district, data]: [string, { votes: { [party: string]: number } }]
			) => {
				acc[district] = Object.values(data.votes).reduce((sum, current) => sum + current, 0);
				return acc;
			},
			{}
		)[district];
		const allowed = allowedVoters[district]; // Vermeidung von Division durch Null
		acc[district] = allowed > 0 ? votes / allowed : 0; // Verhältnis berechnen
		return acc;
	}, {});
}
