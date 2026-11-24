import { QuantParameters } from './types';

export const DEFAULT_QUANT_PARAMS: QuantParameters = {
  rsiPeriod: 14,
  rsiOversold: 30,
  rsiOverbought: 70,
  macdFast: 12,
  macdSlow: 26,
  macdSignal: 9,
  volatilityBandMultiplier: 2.0,
  riskMultiplier: 1.5,
  targetProfitPct: 3.5,
};
