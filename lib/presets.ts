import { PresetBasket, QuantParameters } from './types';

export const PRESET_BASKETS: PresetBasket[] = [
  {
    id: 'nifty_titans',
    name: 'Nifty Titans',
    description: 'Top market-cap heavyweight leaders driving Indian indices',
    icon: '👑',
    tickers: ['RELI_NSE', 'TCS_NSE', 'HDFC_NSE', 'INFY_NSE', 'ICICIBANK_NSE'],
  },
  {
    id: 'banking_giants',
    name: 'Banking & Financials',
    description: 'Tier-1 public and private banking powerhouses',
    icon: '🏦',
    tickers: ['HDFC_NSE', 'ICICIBANK_NSE', 'SBIN_NSE', 'KOTAKBANK_NSE', 'AXISBANK_NSE'],
  },
  {
    id: 'tech_leaders',
    name: 'Tech & IT Services',
    description: 'Global IT exporters with high return-on-equity',
    icon: '💻',
    tickers: ['TCS_NSE', 'INFY_NSE', 'WIPRO_NSE', 'TCS_BSE', 'INFY_BSE'],
  },
  {
    id: 'high_beta',
    name: 'High Beta Volatility',
    description: 'Dynamic momentum movers with elevated order-flow velocity',
    icon: '⚡',
    tickers: ['ADANIENT_NSE', 'TATAMOTORS_NSE', 'MARUTI_NSE', 'SBIN_NSE'],
  },
  {
    id: 'infrastructure_energy',
    name: 'Infra & Energy',
    description: 'Core industrial giants, power generation & green energy',
    icon: '⚡',
    tickers: ['LT_NSE', 'POWERGRID_NSE', 'NTPC_NSE', 'ULTRACEMCO_NSE', 'SUNPHARMA_NSE'],
  },
];

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
