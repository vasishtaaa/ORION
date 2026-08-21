export interface ValidationResult<T> {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
  data?: T;
}

export interface TradeInputForm {
  accountSize: number;
  riskPercentage: number;
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
}

export function validateTradeForm(form: TradeInputForm): ValidationResult<TradeInputForm> {
  const errors: Partial<Record<keyof TradeInputForm, string>> = {};

  if (!form.accountSize || form.accountSize <= 0) {
    errors.accountSize = 'Account size must be greater than 0';
  }

  if (form.riskPercentage <= 0 || form.riskPercentage > 10) {
    errors.riskPercentage = 'Risk must be between 0.1% and 10%';
  }

  if (!form.entryPrice || form.entryPrice <= 0) {
    errors.entryPrice = 'Entry price must be positive';
  }

  if (!form.stopLossPrice || form.stopLossPrice <= 0) {
    errors.stopLossPrice = 'Stop loss price must be positive';
  } else if (form.stopLossPrice === form.entryPrice) {
    errors.stopLossPrice = 'Stop loss cannot equal entry price';
  }

  if (!form.targetPrice || form.targetPrice <= 0) {
    errors.targetPrice = 'Target price must be positive';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: form,
  };
}

export function calculateTradeMetrics(form: TradeInputForm) {
  const riskAmount = (form.accountSize * form.riskPercentage) / 100;
  const isLong = form.targetPrice > form.entryPrice;
  const priceRiskPerShare = Math.abs(form.entryPrice - form.stopLossPrice);
  
  if (priceRiskPerShare <= 0) {
    return null;
  }

  const shares = Math.floor(riskAmount / priceRiskPerShare);
  const totalCost = shares * form.entryPrice;
  const potentialLoss = shares * priceRiskPerShare;
  const potentialProfit = shares * Math.abs(form.targetPrice - form.entryPrice);
  const riskRewardRatio = priceRiskPerShare > 0 ? potentialProfit / potentialLoss : 0;

  return {
    accountSize: form.accountSize,
    riskPercentage: form.riskPercentage,
    entryPrice: form.entryPrice,
    stopLossPrice: form.stopLossPrice,
    targetPrice: form.targetPrice,
    positionSize: totalCost,
    shares,
    totalCost,
    potentialLoss,
    potentialProfit,
    riskRewardRatio: Number(riskRewardRatio.toFixed(2)),
    isLong,
  };
}
