'use client';
import React, { useState } from 'react';
import { VortexSnapshot } from '@/lib/types';
import { exportCandlesToCSV, exportSnapshotToJSON, triggerPrintSummaryReport } from '@/lib/export';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Download, FileSpreadsheet, FileJson, Printer, Share2 } from 'lucide-react';

interface ExportToolbarProps {
  snapshot: VortexSnapshot;
}

export function ExportToolbar({ snapshot }: ExportToolbarProps) {
  const { success } = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  const handleExportCSV = () => {
    exportCandlesToCSV(snapshot);
    success(`Exported ${snapshot.ticker} tick and candle history to CSV`);
  };

  const handleExportJSON = () => {
    exportSnapshotToJSON(snapshot);
    success(`Exported ${snapshot.ticker} telemetry snapshot to JSON`);
  };

  const handlePrint = () => {
    triggerPrintSummaryReport();
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCSV}
          leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
        >
          Export CSV
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportJSON}
          leftIcon={<FileJson className="w-3.5 h-3.5 text-cyan-400" />}
        >
          Export JSON
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePrint}
          leftIcon={<Printer className="w-3.5 h-3.5 text-amber-400" />}
        >
          PDF Report
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setModalOpen(true)}
          leftIcon={<Share2 className="w-3.5 h-3.5" />}
        >
          Snapshot Preview
        </Button>
      </div>

      {/* Snapshot Preview Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Telemetry Snapshot: ${snapshot.ticker}`}
        description="Raw JSON telemetry payload payload streamed over WebSocket"
      >
        <div className="max-h-80 overflow-y-auto p-3 rounded-xl bg-[#000a05] border border-[rgba(80,200,120,0.15)] font-mono text-[11px] text-[#00ff87]">
          <pre>{JSON.stringify(snapshot, null, 2)}</pre>
        </div>
      </Modal>
    </>
  );
}
