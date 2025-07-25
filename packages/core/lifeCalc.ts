/**
 * More Minutes Life Expectancy Calculator
 * Based on SSA 2022 Period Life Table and Gompertz Mortality Model
 */

import lifeTables from './data/ssa2022.json';
import { createHash } from 'crypto';

export interface LifeInput {
  dob: string; // YYYY-MM-DD format
  sex: 'male' | 'female';
  userUid?: string; // For deterministic seed
}

export interface LifePrediction {
  predictedDeathDate: Date;
  baseRemainingYears: number;
  adjustedYears?: number;
  currentAge: number;
  factors: {
    sex: string;
    currentAge: number;
    baseMortalityRate: number;
    gompertzAdjustment: number;
  };
}

// Gompertz model parameters calibrated to SSA data
const GOMPERTZ_B = 0.000045; // Force of mortality at younger ages
const GOMPERTZ_C = 1.098;    // Rate of mortality increase with age

/**
 * Generate deterministic seed for consistent predictions
 */
function generateSeed(userUid: string, dob: string): number {
  const secretSalt = process.env.LIFE_CALC_SALT || 'moreminutes_secret_2024';
  const seedString = `${userUid}${dob}${secretSalt}`;
  const hash = createHash('sha256').update(seedString).digest('hex');
  
  // Convert first 8 chars of hash to number
  return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
}

/**
 * Calculate current age in years from date of birth
 */
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
}

/**
 * Get mortality rate from SSA life table
 */
function getMortalityRate(age: number, sex: 'male' | 'female'): number {
  const table = lifeTables[sex];
  const tableAge = Math.min(Math.floor(age), table.length - 1);
  return table[tableAge];
}

/**
 * Apply Gompertz model adjustment
 */
function applyGompertzModel(baseMortality: number, age: number, randomSeed: number): number {
  // Gompertz formula: μ(x) = b * c^x
  const gompertzRate = GOMPERTZ_B * Math.pow(GOMPERTZ_C, age);
  
  // Blend SSA table with Gompertz model
  const blendFactor = 0.3; // 30% Gompertz, 70% SSA table
  const adjustedRate = baseMortality * (1 - blendFactor) + gompertzRate * blendFactor;
  
  // Add controlled randomness using deterministic seed
  const variance = 0.1; // ±10% variance
  const randomFactor = 1 + (randomSeed - 0.5) * 2 * variance;
  
  return Math.max(0.0001, adjustedRate * randomFactor);
}

/**
 * Calculate remaining life expectancy
 */
function calculateRemainingYears(currentAge: number, sex: 'male' | 'female', randomSeed: number): number {
  let remainingYears = 0;
  let survivalProbability = 1.0;
  
  // Calculate expected remaining years using life table
  for (let age = currentAge; age < 120; age++) {
    const mortalityRate = getMortalityRate(age, sex);
    const adjustedRate = applyGompertzModel(mortalityRate, age, randomSeed);
    
    // Probability of surviving this year
    const yearSurvivalProb = 1 - adjustedRate;
    survivalProbability *= yearSurvivalProb;
    
    // Add the probability-weighted year to life expectancy
    remainingYears += survivalProbability;
    
    // Stop when survival probability becomes negligible
    if (survivalProbability < 0.001) break;
  }
  
  return remainingYears;
}

/**
 * Main life calculation function
 */
export function calculateLifeExpectancy(input: LifeInput): LifePrediction {
  const currentAge = calculateAge(input.dob);
  
  // Generate deterministic seed if userUid provided
  const randomSeed = input.userUid 
    ? generateSeed(input.userUid, input.dob)
    : Math.random();
  
  // Get base mortality rate for current age
  const baseMortalityRate = getMortalityRate(currentAge, input.sex);
  
  // Calculate remaining years using enhanced model
  const baseRemainingYears = calculateRemainingYears(currentAge, input.sex, randomSeed);
  
  // Calculate predicted death date
  const today = new Date();
  const predictedDeathDate = new Date(today);
  predictedDeathDate.setFullYear(today.getFullYear() + Math.round(baseRemainingYears));
  
  // Gompertz adjustment for documentation
  const gompertzRate = GOMPERTZ_B * Math.pow(GOMPERTZ_C, currentAge);
  
  return {
    predictedDeathDate,
    baseRemainingYears: Math.round(baseRemainingYears * 100) / 100, // Round to 2 decimals
    currentAge,
    factors: {
      sex: input.sex,
      currentAge,
      baseMortalityRate,
      gompertzAdjustment: gompertzRate,
    },
  };
}

/**
 * Simulate longevity nudge (lifestyle improvements)
 */
export function simulateLongevityNudge(
  basePrediction: LifePrediction, 
  improvementFactor: number = 1.02 // 2% improvement default
): LifePrediction {
  const adjustedYears = basePrediction.baseRemainingYears * improvementFactor;
  const yearsDifference = adjustedYears - basePrediction.baseRemainingYears;
  
  const newDeathDate = new Date(basePrediction.predictedDeathDate);
  newDeathDate.setDate(newDeathDate.getDate() + (yearsDifference * 365.25));
  
  return {
    ...basePrediction,
    predictedDeathDate: newDeathDate,
    adjustedYears: Math.round(adjustedYears * 100) / 100,
    factors: {
      ...basePrediction.factors,
      gompertzAdjustment: basePrediction.factors.gompertzAdjustment * (2 - improvementFactor), // Inverse adjustment
    },
  };
}

/**
 * Export for algorithm transparency (as required by product spec)
 */
export const ALGORITHM_INFO = {
  dataSource: "U.S. Social Security Administration 2022 Period Life Table",
  methodology: "Gompertz mortality model with deterministic seed generation",
  parameters: {
    gompertzB: GOMPERTZ_B,
    gompertzC: GOMPERTZ_C,
  },
  privacy: "All calculations performed locally in browser, no data transmitted to servers",
  disclaimer: "For entertainment only, not medical advice",
} as const; 