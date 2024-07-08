// Import the entire mathjs module into a namespace
import * as Math from 'mathjs';

export function calculateSeats(district) {
	const totalSeats = district.total_seats;
	const votes = district.votes;
	const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);
	const requiredVotesPerSeat = Math.ceil(totalVotes / totalSeats);

	// first distribution of seats
	let seats = {};
	Object.keys(votes).forEach((party) => {
		seats[party] = Math.floor(votes[party] / requiredVotesPerSeat);
	});

	let remainingSeats = totalSeats - Object.values(seats).reduce((a, b) => a + b, 0);
	// distribution of remaining seats
	let quotients = {};
	Object.keys(votes).forEach((party) => {
		quotients[party] = votes[party] / (seats[party] * 2 + 1);
	});

	while (remainingSeats > 0) {
		const maxQuotient = Math.max(...Object.values(quotients));
		const maxParty = Object.keys(quotients).find(
			(party) => Math.abs(quotients[party] - maxQuotient) < 1e-6
		);
		seats[maxParty] += 1;
		quotients[maxParty] = votes[maxParty] / (seats[maxParty] * 2 + 1);
		remainingSeats -= 1;
	}
	return seats;
}
