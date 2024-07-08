import * as Math from 'mathjs';

// Definieren eines Typs für das Eingabeobjekt
interface District {
	total_seats: number;
	votes: { [party: string]: number };
}

// Definieren eines Typs für das Ausgabeobjekt
type SeatDistribution = { [party: string]: number };

export function calculateSeats(district: District): SeatDistribution {
	const totalSeats: number = district.total_seats;
	const votes: { [party: string]: number } = district.votes;
	const totalVotes: number = Object.values(votes).reduce((a, b) => a + b, 0);
	const requiredVotesPerSeat: number = Math.ceil(totalVotes / totalSeats);

	let seats: SeatDistribution = {};
	Object.keys(votes).forEach((party) => {
		seats[party] = Math.floor(votes[party] / requiredVotesPerSeat);
	});

	let remainingSeats: number = totalSeats - Object.values(seats).reduce((a, b) => a + b, 0);

	let quotients: { [party: string]: number } = {};
	Object.keys(votes).forEach((party) => {
		quotients[party] = votes[party] / (seats[party] * 2 + 1);
	});

	while (remainingSeats > 0) {
		const maxQuotient: number = Math.max(...Object.values(quotients));
		const maxParty: string | undefined = Object.keys(quotients).find(
			(party) => Math.abs(quotients[party] - maxQuotient) < 1e-6
		);
		if (maxParty) {
			seats[maxParty] += 1;
			quotients[maxParty] = votes[maxParty] / (seats[maxParty] * 2 + 1);
		}
		remainingSeats -= 1;
	}
	return seats;
}
