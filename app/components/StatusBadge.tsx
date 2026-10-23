import React from 'react';
import { JobStatus } from '@/app/lib/store';

const badgeConfig: Record<JobStatus | 'purged', { label: string; className: string }> = {
  pending:   { label: 'Pending',           className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' },
  printing:  { label: 'In Printing',       className: 'bg-blue-500/20 text-blue-300 border border-blue-500/40' },
  ready:     { label: 'Ready for Pickup',  className: 'bg-green-500/20 text-green-300 border border-green-500/40' },
  completed: { label: 'Completed',         className: 'bg-gray-500/20 text-gray-400 border border-gray-500/40' },
  cancelled: { label: 'Cancelled',         className: 'bg-red-500/20 text-red-400 border border-red-500/40' },
  purged:    { label: 'Purged',            className: 'bg-gray-600/20 text-gray-500 border border-gray-600/40' },
};

export default function StatusBadge({ status, purged }: { status: JobStatus; purged?: boolean }) {
  const key = purged && status === 'completed' ? 'purged' : status;
  const cfg = badgeConfig[key] || badgeConfig.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
