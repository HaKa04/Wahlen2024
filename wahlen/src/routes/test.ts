// test.js
import { calculateSeats } from './calculateSeats.ts';
import { getDistrictVotes } from './districtVotes.ts';
const result = calculateSeats(getDistrictVotes().Kleinbasel);
console.log(result);
