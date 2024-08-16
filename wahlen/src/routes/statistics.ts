import * as Math from 'mathjs';
import {calculateSeats} from './calculateSeats.ts';

interface VoteCounts {
    [party: string]: number;
}
interface DistrictVotes{
        votes: VoteCounts;
        total_seats: number;
    }

export function getVotesforExtraSeatsTotalAllDistricts(districts:{[district:string]:DistrictVotes}) : {[district:string]:{[party:string]:number}} {
    let result:{[district:string]:{[party:string]:number}} = {};
    for (let district in districts){
        result[district] = getVotesforExtraSeatsTotal(districts[district]);
    }
    return result;

}

export function getVotesforExtraSeatsTotal(district:DistrictVotes): {[party:string]:number} {
    let result:{[party:string]:number} = {};
    for (let party in district.votes){
        result[party] = calculateVotesforExtraSeat(district, party);
    }
    return result;
}

function calculateVotesforExtraSeat(Votes:{votes:VoteCounts, total_seats:number}, party:string):number {
let seatDistribution:VoteCounts = calculateSeats(Votes);
let seatsOfParty:number = seatDistribution[party];
let totalSeats:number = Votes.total_seats;
let PartyVotes:number = Votes.votes[party];
let neededVotes:number = 0;
let totalVotes:number = 0;
let VotesCopy = {
    votes: { ...Votes.votes },
    total_seats: Votes.total_seats
};

for (let party in Votes.votes) {
    totalVotes += Votes.votes[party];
}
if (seatsOfParty === totalSeats) {
    return neededVotes;
}
else {
    let minMoreVotes:number = 1;
    let maxMoreVotes:number = totalVotes/totalSeats;
    while (true) {
        VotesCopy.votes[party] = maxMoreVotes;
        let seatDistributionCopy = calculateSeats(VotesCopy);
        if (seatDistributionCopy[party] > seatsOfParty) {
            break;
        }
        else {
            maxMoreVotes = maxMoreVotes * 2;
        }
    }
    // find the exact number of needed Votes between minMoreVotes and maxMoreVotes so that the party gets one more seat with binary search
    while (minMoreVotes < maxMoreVotes) {
        let middleMoreVotes = Math.ceil((minMoreVotes + maxMoreVotes) / 2);
        VotesCopy.votes[party] = middleMoreVotes;
        let seatDistributionCopy = calculateSeats(VotesCopy);
        if (seatDistributionCopy[party] > seatsOfParty) {
            maxMoreVotes = middleMoreVotes;
        }
        else {
            minMoreVotes = middleMoreVotes + 1;
        }
    }
    neededVotes = minMoreVotes;
    return neededVotes;
}
}