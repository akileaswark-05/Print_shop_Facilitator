'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Clock, Hash, FileText, Users } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { PrintJob } from '@/app/lib/store';

export default function QueueStatus() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
      setLastUpdated(new Date());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const activeJobs = jobs.filter(j => j.status === 'printing');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Live Queue Status</h2>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Auto-refreshes every 10s • {lastUpdated ? `Last synchronized at ${lastUpdated.toLocaleTimeString()}` : 'Connecting...'}
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl transition-colors text-xs font-semibold border border-slate-300 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          Refresh Queue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-8">
        <div className="bg-white border border-blue-200/70 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">In Line</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0F2942] flex items-center justify-center border border-blue-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{pendingJobs.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Pending student orders</p>
        </div>

        <div className="bg-white border border-sky-200/70 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Printing Now</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900">{activeJobs.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Running on shop printers</p>
        </div>

        <div className="bg-white border border-emerald-200/70 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Est. Queue Time</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-700">
            {Math.round(pendingJobs.reduce((s, j) => s + j.pageCount * j.copies, 0) * 3 / 60)} <span className="text-lg font-bold">mins</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Based on total pages ahead</p>
        </div>
      </div>

      {/* Job List */}
      {loading ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm font-medium">
          Loading current campus print queue...
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto mb-3 flex items-center justify-center border border-slate-200">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-slate-800 font-bold text-base">The Queue is Currently Empty</p>
          <p className="text-slate-500 text-xs mt-1">Submit your document on the Student Order tab to be first in line!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-xs transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-[#0F2942] text-amber-300 font-black text-base px-3.5 py-2 rounded-xl text-center shadow-xs min-w-[70px]">
                  {job.token}
                </div>
                <div className="sm:hidden flex-1 flex justify-end">
                  <StatusBadge status={job.status} purged={job.purged} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-bold text-sm truncate">{job.purged ? '[Document Purged & Claimed]' : job.fileName}</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  <span className="font-semibold text-slate-700">{job.studentName}</span> • {job.pageCount} pages × {job.copies} {job.copies > 1 ? 'copies' : 'copy'} • {job.printType === 'color' ? 'Color' : 'B&W'} • {job.sides === 'double' ? 'Double' : 'Single'}-sided
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {job.status === 'pending' && (
                  <div className="text-left sm:text-right">
                    <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                      <Hash className="w-3 h-3 text-[#0F2942]" />
                      <span>#{job.queuePosition} in line</span>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px] sm:justify-end mt-0.5">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>~{job.estimatedWaitMinutes}m wait</span>
                    </div>
                  </div>
                )}
                <div className="hidden sm:block">
                  <StatusBadge status={job.status} purged={job.purged} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
