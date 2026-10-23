'use client';
import { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Printer, XCircle, Key, RefreshCw, Lock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { PrintJob, JobStatus } from '@/app/lib/store';

const OPERATOR_PIN = '1234';

export default function OperatorPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');

  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinInput, setPinInput] = useState<Record<string, string>>({});
  const [pinError, setPinError] = useState<Record<string, string>>({});
  const [pinVerified, setPinVerified] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (!authenticated) return;
    fetchJobs();
    const interval = setInterval(fetchJobs, 8000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const handleAuth = () => {
    if (authPin === OPERATOR_PIN) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid operator PIN. Try again.');
    }
  };

  const updateStatus = async (id: string, status: JobStatus) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchJobs();
    setActionLoading(prev => ({ ...prev, [id]: false }));
  };

  const verifyPin = async (job: PrintJob) => {
    const pin = pinInput[job.id] || '';
    if (pin.length !== 4) {
      setPinError(prev => ({ ...prev, [job.id]: 'PIN must be 4 digits' }));
      return;
    }
    const res = await fetch('/api/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: job.token, pin }),
    });
    if (res.ok) {
      setPinVerified(prev => ({ ...prev, [job.id]: true }));
      setPinError(prev => ({ ...prev, [job.id]: '' }));
    } else {
      setPinError(prev => ({ ...prev, [job.id]: 'Invalid PIN. Try again.' }));
      setPinVerified(prev => ({ ...prev, [job.id]: false }));
    }
  };

  // Operator login gate
  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto py-20 px-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Operator Portal</h2>
          <p className="text-gray-400 text-sm mb-6">Enter your operator PIN to access the dashboard</p>
          <input
            type="password"
            value={authPin}
            onChange={e => setAuthPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="Enter PIN"
            maxLength={6}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-xl tracking-widest placeholder-gray-600 focus:outline-none focus:border-indigo-500 mb-3"
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button
            onClick={handleAuth}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Unlock Portal
          </button>
          <p className="text-gray-600 text-xs mt-4">Demo PIN: 1234</p>
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => ['pending', 'printing', 'ready'].includes(j.status));
  const completedJobs = jobs.filter(j => ['completed', 'cancelled'].includes(j.status));

  const renderJobCard = (job: PrintJob) => (
    <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Job Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600/20 text-indigo-400 font-bold text-lg px-3 py-1 rounded-lg">
            {job.token}
          </div>
          <div>
            <p className="text-white font-medium">{job.purged ? '[Document Purged]' : job.fileName}</p>
            <p className="text-gray-400 text-sm">{job.studentName}</p>
          </div>
        </div>
        <StatusBadge status={job.status} purged={job.purged} />
      </div>

      {/* Job Details */}
      <div className="px-4 py-3 bg-gray-900/50 flex flex-wrap gap-4 text-sm border-b border-gray-800">
        <span className="text-gray-400">Pages: <span className="text-white">{job.pageCount}</span></span>
        <span className="text-gray-400">Copies: <span className="text-white">{job.copies}</span></span>
        <span className="text-gray-400">Type: <span className="text-white">{job.printType === 'color' ? 'Color' : 'B&W'}</span></span>
        <span className="text-gray-400">Sides: <span className="text-white">{job.sides === 'double' ? 'Double' : 'Single'}</span></span>
        <span className="text-gray-400">Cost: <span className="text-green-400 font-medium">&#8377;{job.totalCost}</span></span>
        <span className="text-gray-400">Txn: <span className="text-gray-300 font-mono text-xs">{job.transactionId}</span></span>
      </div>

      {/* Actions */}
      {(job.status === 'pending' || job.status === 'printing' || job.status === 'ready') && (
        <div className="p-4 space-y-3">
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {job.status === 'pending' && (
              <button
                onClick={() => updateStatus(job.id, 'printing')}
                disabled={actionLoading[job.id]}
                className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                Mark as Printing
              </button>
            )}
            {job.status === 'printing' && (
              <button
                onClick={() => updateStatus(job.id, 'ready')}
                disabled={actionLoading[job.id]}
                className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Mark as Ready for Pickup
              </button>
            )}
            {job.status !== 'cancelled' && (
              <button
                onClick={() => updateStatus(job.id, 'cancelled')}
                disabled={actionLoading[job.id]}
                className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Cancel Job
              </button>
            )}
          </div>

          {/* PIN Verification for Ready jobs */}
          {job.status === 'ready' && (
            <div className="bg-gray-800 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm font-medium">Student PIN Verification</span>
              </div>
              {pinVerified[job.id] ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PIN Verified — Student identity confirmed</span>
                  </div>
                  <button
                    onClick={() => updateStatus(job.id, 'completed')}
                    disabled={actionLoading[job.id]}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete & Purge Document
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pinInput[job.id] || ''}
                    onChange={e => setPinInput(prev => ({ ...prev, [job.id]: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="Enter student's 4-digit PIN"
                    maxLength={4}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-yellow-500 tracking-widest"
                  />
                  <button
                    onClick={() => verifyPin(job)}
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Verify
                  </button>
                </div>
              )}
              {pinError[job.id] && (
                <p className="text-red-400 text-xs mt-2">{pinError[job.id]}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-indigo-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Operator Dashboard</h2>
            <p className="text-gray-400 text-sm mt-0.5">Manage print jobs and verify student pickups</p>
          </div>
        </div>
        <button
          onClick={fetchJobs}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors text-sm border border-gray-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading jobs...</div>
      ) : (
        <>
          {/* Active Jobs */}
          <div className="mb-8">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              Active Jobs ({activeJobs.length})
            </h3>
            {activeJobs.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center text-gray-500 text-sm">
                No active jobs at the moment
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobs.map(renderJobCard)}
              </div>
            )}
          </div>

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <div>
              <h3 className="text-gray-500 font-semibold mb-3 text-sm uppercase tracking-wider">
                Completed / Cancelled ({completedJobs.length})
              </h3>
              <div className="space-y-2">
                {completedJobs.map(job => (
                  <div key={job.id} className="bg-gray-900/60 border border-gray-800/60 rounded-xl p-4 flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 font-mono text-sm">{job.token}</span>
                      <span className="text-gray-500 text-sm">{job.purged ? '[Purged]' : job.fileName} — {job.studentName}</span>
                    </div>
                    <StatusBadge status={job.status} purged={job.purged} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
