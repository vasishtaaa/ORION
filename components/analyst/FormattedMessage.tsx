'use client';
import { Sparkles } from 'lucide-react';

interface FormattedMessageProps {
  content: string;
}

export function FormattedMessage({ content }: FormattedMessageProps) {
  const lines = content.split('\n');

  return (
    <div className="flex flex-col gap-3.5 text-xs sm:text-sm leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Heading: ### Heading
        if (trimmed.startsWith('### ')) {
          const headingText = trimmed.replace('### ', '');
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 pb-2 mb-1 border-b border-white/10 text-white font-mono font-bold text-sm sm:text-base tracking-wide"
            >
              <div className="w-2 h-2 rounded-full bg-[#00ff87] shadow-[0_0_10px_rgba(0,255,135,0.8)]" />
              <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                {headingText}
              </span>
            </div>
          );
        }

        // Callout quote: > Note
        if (trimmed.startsWith('> ')) {
          const quoteText = trimmed.replace('> ', '');
          return (
            <div
              key={idx}
              className="my-2 p-3.5 rounded-xl bg-emerald-950/40 border border-[#00ff87]/30 flex items-start gap-3 text-emerald-300 font-mono text-xs shadow-[0_0_20px_rgba(0,255,135,0.06)]"
            >
              <Sparkles className="w-4 h-4 text-[#00ff87] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {renderFormattedInline(quoteText)}
              </div>
            </div>
          );
        }

        // Bullet point: - Item
        if (trimmed.startsWith('- ')) {
          const bulletText = trimmed.replace('- ', '');
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff87] shrink-0 mt-2 shadow-[0_0_6px_rgba(0,255,135,0.6)]" />
              <div className="font-mono text-xs sm:text-xs text-slate-300 leading-relaxed flex-1">
                {renderFormattedInline(bulletText)}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="font-mono text-xs text-slate-300 leading-relaxed">
            {renderFormattedInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Helper to parse **bold** and highlights
function renderFormattedInline(text: string) {
  // Split by bold tokens **...**
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      // Highlight special values like BUY, SELL, prices, percentages
      const isPositive = inner.includes('+') || inner.includes('BUY') || inner.includes('Bullish');
      const isNegative = inner.includes('-') && !inner.includes('–') || inner.includes('SELL') || inner.includes('Bearish');
      const isPrice = inner.startsWith('₹') || inner.startsWith('$');

      let colorClass = 'text-white font-bold';
      if (isPositive) colorClass = 'text-[#00ff87] font-bold';
      else if (isNegative) colorClass = 'text-rose-400 font-bold';
      else if (isPrice) colorClass = 'text-cyan-300 font-bold';

      return (
        <strong key={i} className={`font-mono ${colorClass}`}>
          {inner}
        </strong>
      );
    }
    return part;
  });
}
export default FormattedMessage;
