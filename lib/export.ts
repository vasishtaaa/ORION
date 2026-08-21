import { VortexSnapshot, ScreenerItem, NewsItem } from './types';

/**
 * Trigger browser file download from Blob
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export live candles and tick history to CSV
 */
export function exportCandlesToCSV(snapshot: VortexSnapshot) {
  if (!snapshot || !snapshot.candles) return;
  const headers = ['Timestamp', 'Open', 'High', 'Low', 'Close', 'Volume'];
  const rows = snapshot.candles.map(c => [
    `"${c.t}"`,
    c.o.toFixed(2),
    c.h.toFixed(2),
    c.l.toFixed(2),
    c.c.toFixed(2),
    c.v || 0,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `vortex_${snapshot.ticker}_candles_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export Screener Data to CSV
 */
export function exportScreenerToCSV(screener: ScreenerItem[]) {
  if (!screener || !screener.length) return;
  const headers = ['Ticker', 'Name', 'Price (INR)', 'Prev Close', 'Change %', 'RSI', 'Quant Score', 'Signal', 'Volume'];
  const rows = screener.map(item => [
    `"${item.ticker}"`,
    `"${item.name}"`,
    item.price.toFixed(2),
    item.prev_close.toFixed(2),
    item.change_pct.toFixed(2),
    item.rsi.toFixed(1),
    item.quant_score.toFixed(3),
    item.recommendation || item.signal || 'HOLD',
    item.volume,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `vortex_market_screener_${new Date().toISOString().slice(0, 10)}.csv`);
}

/**
 * Export Live Snapshot as JSON
 */
export function exportSnapshotToJSON(snapshot: VortexSnapshot) {
  if (!snapshot) return;
  const jsonContent = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  downloadBlob(blob, `vortex_${snapshot.ticker}_snapshot_${Date.now()}.json`);
}

/**
 * Print / Save formatted institutional summary report
 */
export function triggerPrintSummaryReport() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
