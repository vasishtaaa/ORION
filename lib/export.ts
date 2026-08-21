import { VortexSnapshot, ScreenerItem } from './types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportCandlesToCSV(snapshot: VortexSnapshot) {
  if (!snapshot?.candles || snapshot.candles.length === 0) return;

  const headers = ['Timestamp', 'Open', 'High', 'Low', 'Close', 'Volume'];
  const rows = snapshot.candles.map((c) => [
    c.t,
    c.o.toFixed(2),
    c.h.toFixed(2),
    c.l.toFixed(2),
    c.c.toFixed(2),
    (c.v || 0).toString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `ORION_${snapshot.ticker}_candles_${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportScreenerToCSV(items: ScreenerItem[]) {
  if (!items || items.length === 0) return;

  const headers = ['Ticker', 'Name', 'Price', 'Change%', 'RSI', 'QuantScore', 'Signal', 'Volume'];
  const rows = items.map((item) => [
    item.ticker,
    `"${item.name}"`,
    item.price.toFixed(2),
    item.change_pct.toFixed(2),
    item.rsi.toFixed(1),
    item.quant_score.toFixed(3),
    item.recommendation || item.signal || 'HOLD',
    item.volume.toString(),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `ORION_Screener_Data.csv`);
}

export function exportSnapshotToJSON(snapshot: VortexSnapshot) {
  if (!snapshot) return;
  const jsonStr = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `ORION_${snapshot.ticker}_snapshot_${Date.now()}.json`);
}

export function triggerPrintSummaryReport() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
