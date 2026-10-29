// New earnings are 40% of the previous .8 oil / .9 merit rates. Existing balances, prices and coupons are untouched.
export const OIL_GAIN_FACTOR=.32,MERIT_GAIN_FACTOR=.36;
export const oilGain=amount=>Math.round(Math.max(0,amount)*OIL_GAIN_FACTOR);
export const meritGain=amount=>Math.round(Math.max(0,amount)*MERIT_GAIN_FACTOR);
export const DAILY_OIL=oilGain(20),DAILY_MERIT=meritGain(30);
