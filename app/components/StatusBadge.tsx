import React from 'react';
import { JobStatus } from '@/app/lib/store';

const badgeConfig: Record<JobStatus | 'purged', { label: string; dot: string; className: string }> = {
  pending:   { label: 'Pending in Queue', dot: 'bg-amber-500',   className: 'bg-amber-50 text-amber-800 border-amber-200/80' },
  printing:  { label: 'Printing Now',     dot: 'bg-blue-600 animate-pulse', className: 'bg-blue-50 text-blue-800 border-blue-200/80' },
  ready:     { label: 'Ready for Pickup', dot: 'bg-emerald-500', className: 'bg-emerald-50 text-emerald-800 border-emerald-200/80' },
  completed: { label: 'Completed',        dot: 'bg-slate-400',   className: 'bg-slate-100 text-slate-700 border-slate-200' },
  cancelled: { label: 'Cancelled',        dot: 'bg-rose-500',    className: 'bg-rose-50 text-rose-700 border-rose-200' },
  purged:    { label: 'Purged & Claimed', dot: 'bg-slate-400',   className: 'bg-slate-100 text-slate-500 border-slate-200' },
};

export default function StatusBadge({ status, purged }: { status: JobStatus; purged?: boolean }) {
  const key = purged && status === 'completed' ? 'purged' : status;
  const cfg = badgeConfig[key] || badgeConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
