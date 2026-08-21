'use client';
import React, { useState } from 'react';
import { QuantParameters } from '@/lib/types';
import { DEFAULT_QUANT_PARAMS } from '@/lib/presets';
import { Slider } from '@/components/ui/Slider';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { RotateCcw, Copy } from 'lucide-react';

interface ParameterControlsProps {
  onParamsChange?: (params: QuantParameters) => void;
}

export function ParameterControls({ onParamsChange }: ParameterControlsProps) {
  const { success, info } = useToast();
  const [params, setParams] = useState<QuantParameters>(DEFAULT_QUANT_PARAMS);

  const updateParam = (key: keyof QuantParameters, val: number) => {
    const updated = { ...params, [key]: val };
    setParams(updated);
    if (onParamsChange) onParamsChange(updated);
  };

  const handleReset = () => {
    setParams(DEFAULT_QUANT_PARAMS);
    if (onParamsChange) onParamsChange(DEFAULT_QUANT_PARAMS);
    info('Reset quantitative parameters to institutional defaults');
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(JSON.stringify(params, null, 2));
      success('Copied model parameters to clipboard');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between pb-2 border-b border-[rgba(80,200,120,0.12)]">
        <div>
          <h4 className="text-xs font-mono font-bold text-[var(--matrix-bright)] uppercase">
            Model Hyperparameters
          </h4>
          <p className="text-[10px] font-mono text-[var(--text-muted)]">
            Live technical scoring weights
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="w-3 h-3" />}>
            Reset
          </Button>
          <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={<Copy className="w-3 h-3" />}>
            Copy JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Slider
          label="RSI Lookback"
          value={params.rsiPeriod}
          min={5}
          max={30}
          step={1}
          onChange={(v) => updateParam('rsiPeriod', v)}
        />
        <Slider
          label="MACD Fast"
          value={params.macdFast}
          min={5}
          max={20}
          step={1}
          onChange={(v) => updateParam('macdFast', v)}
        />
        <Slider
          label="MACD Slow"
          value={params.macdSlow}
          min={20}
          max={45}
          step={1}
          onChange={(v) => updateParam('macdSlow', v)}
        />
        <Slider
          label="Risk Multiplier"
          value={params.riskMultiplier}
          min={0.5}
          max={3.0}
          step={0.1}
          unit="x"
          onChange={(v) => updateParam('riskMultiplier', v)}
        />
        <Slider
          label="Target Profit"
          value={params.targetProfitPct}
          min={1.0}
          max={10.0}
          step={0.5}
          unit="%"
          onChange={(v) => updateParam('targetProfitPct', v)}
        />
        <Slider
          label="Volatility Band"
          value={params.volatilityBandMultiplier}
          min={1.0}
          max={3.5}
          step={0.1}
          unit="σ"
          onChange={(v) => updateParam('volatilityBandMultiplier', v)}
        />
      </div>
    </div>
  );
}
