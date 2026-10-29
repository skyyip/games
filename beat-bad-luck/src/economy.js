// Apply only to newly earned rewards. Existing balances, prices and coupons are untouched.
export const OIL_GAIN_FACTOR=.8,MERIT_GAIN_FACTOR=.9;
export const oilGain=amount=>Math.round(Math.max(0,amount)*OIL_GAIN_FACTOR);
export const meritGain=amount=>Math.round(Math.max(0,amount)*MERIT_GAIN_FACTOR);
export const DAILY_OIL=oilGain(20),DAILY_MERIT=meritGain(30);
