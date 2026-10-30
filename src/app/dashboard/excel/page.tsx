'use client';

import React from 'react';
import { ExcelTableModal } from '@/components/inventaire/ExcelTableModal';

export default function ExcelPage() {
  return (
    <div className="h-[calc(100vh-6.5rem)] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-border shadow-sm flex flex-col">
      <ExcelTableModal isOpen={true} onClose={() => {}} isEmbedded={true} initialTab="ECRANS" />
    </div>
  );
}
