import React from 'react';
import { Button } from '@pandora-codex/ui-kit';
import { Download, FileJson } from 'lucide-react';

export const RepairReportExport: React.FC = () => {
  const exportPDF = () => {
    alert('PDF export would be implemented here');
  };

  const exportJSON = () => {
    alert('JSON export would be implemented here');
  };

  return (
    <div className="flex gap-2">
      <Button onClick={exportPDF} variant="secondary" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
      <Button onClick={exportJSON} variant="ghost" size="sm">
        <FileJson className="h-4 w-4 mr-2" />
        Export JSON
      </Button>
    </div>
  );
};
