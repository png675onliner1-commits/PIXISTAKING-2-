
import { StakingPlan } from './types';

export const DAILY_YIELD = 0.14; // 14% daily
export const REFERRAL_COMMISSION = 0.10; // 10%

export const STAKING_PLANS: StakingPlan[] = [
  { id: 'trial', name: 'Starter Trial', min: 10, max: 10, duration: 3, limit: 1 },
  { id: 'bronze', name: 'Bronze Plan', min: 10.01, max: 20, duration: 7, limit: 30 },
  { id: 'silver', name: 'Silver Plan', min: 20.01, max: 50, duration: 14, limit: 30 },
  { id: 'gold', name: 'Gold Plan', min: 50.01, max: 100, duration: 30, limit: 30 },
  { id: 'diamond', name: 'Diamond Plan', min: 100.01, max: 50000, duration: 90, limit: 30 },
];
