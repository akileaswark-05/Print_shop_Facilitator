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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Live Queue Status</h2>
          <p className="text-gray-400 mt-1">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm border border-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total in Queue', value: pendingJobs.length, icon: Users, color: 'text-indigo-400' },
          { label: 'Currently Printing', value: activeJobs.length, icon: RefreshCw, color: 'text-blue-400' },
          { label: 'Est. Total Wait', value: `${Math.round(pendingJobs.reduce((s, j) => s + j.pageCount * j.copies, 0) * 3 / 60)} min`, icon: Clock, color: 'text-green-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-gray-400 text-sm">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Job List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading queue...</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No jobs in queue</p>
          <p className="text-gray-600 text-sm mt-1">Submit a print order to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className="text-center min-w-[60px]">
                <p className="text-xs text-gray-500">Token</p>
                <p className="text-indigo-400 font-bold">{job.token}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{job.purged ? '[Document Purged]' : job.fileName}</p>
                <p className="text-gray-400 text-sm">
                  {job.studentName} • {job.pageCount} pages × {job.copies} {job.copies > 1 ? 'copies' : 'copy'} • {job.printType === 'color' ? 'Color' : 'B&W'} • {job.sides === 'double' ? 'Double' : 'Single'}-sided
                </p>
              </div>
              <div className="text-right">
                {job.status === 'pending' && (
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-1 justify-end">
                    <Hash className="w-3 h-3" />
                    <span>#{job.queuePosition} in queue</span>
                  </div>
                )}
                {job.status === 'pending' && (
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-2 justify-end">
                    <Clock className="w-3 h-3" />
                    <span>~{job.estimatedWaitMinutes} min</span>
                  </div>
                )}
                <StatusBadge status={job.status} purged={job.purged} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
