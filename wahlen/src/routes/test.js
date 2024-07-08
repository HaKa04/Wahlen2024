// test.js
import { calculateSeats } from './calculateSeats.js';
import { getDistrictVotes } from './districtVotes.js';
const result = calculateSeats(getDistrictVotes().Kleinbasel);
console.log(result);
