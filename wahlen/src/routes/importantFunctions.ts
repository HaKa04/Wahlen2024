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