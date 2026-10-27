'use client';
import { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Printer, XCircle, Key, RefreshCw, Lock, FileText, Eye, Download } from 'lucide-react';
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

  const handleViewDocument = (job: PrintJob) => {
    if (!job.fileData) {
      alert('Document file is not available or has been purged.');
      return;
    }
    const win = window.open();
    if (win) {
      win.document.write(
        `<html><head><title>${job.fileName} - Document Preview</title><style>body{margin:0;background:#18181b;display:flex;flex-direction:column;align-items:center;height:100vh;overflow:hidden;}iframe{width:100%;height:100%;border:none;}</style></head><body><iframe src="${job.fileData}"></iframe></body></html>`
      );
      win.document.close();
    } else {
      const a = document.createElement('a');
      a.href = job.fileData;
      a.download = job.fileName;
      a.click();
    }
  };

  const handlePrintDocument = (job: PrintJob) => {
    if (!job.fileData) {
      alert('Document file is not available or has been purged.');
      return;
    }
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = job.fileData;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          const win = window.open(job.fileData || '');
          win?.focus();
          win?.print();
        }
      }, 500);
    };
  };

  const handleDownloadDocument = (job: PrintJob) => {
    if (!job.fileData) {
      alert('File has been purged.');
      return;
    }
    const a = document.createElement('a');
    a.href = job.fileData;
    a.download = job.fileName;
    a.click();
  };

  // Operator login gate
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200/80 text-[#0F2942] flex items-center justify-center mx-auto mb-5 shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operator Portal</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 mb-6">Enter the campus shop administrator PIN to access print job controls and document files.</p>
          <input
            type="password"
            value={authPin}
            onChange={e => setAuthPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            placeholder="Enter operator PIN"
            maxLength={6}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 text-center text-xl tracking-widest placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-[#0F2942] mb-3 font-mono font-bold"
          />
          {authError && <p className="text-rose-600 text-xs font-semibold mb-3">{authError}</p>}
          <button
            onClick={handleAuth}
            className="w-full bg-[#0F2942] hover:bg-[#1A365D] text-white font-bold py-3.5 rounded-xl transition-all shadow-xs text-sm"
          >
            Access Print Control Console
          </button>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-xs">
            <span>Demonstration Access:</span>
            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">1234</span>
          </div>
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => ['pending', 'printing', 'ready'].includes(j.status));
  const completedJobs = jobs.filter(j => ['completed', 'cancelled'].includes(j.status));

  const renderJobCard = (job: PrintJob) => (
    <div key={job.id} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition-all">
      {/* Job Header */}
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-[#0F2942] text-amber-300 font-black text-base px-3.5 py-1.5 rounded-xl shadow-2xs shrink-0">
            {job.token}
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 font-bold text-sm truncate">{job.purged ? '[Document Purged & Claimed]' : job.fileName}</p>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">{job.studentName}</p>
          </div>
        </div>
        <StatusBadge status={job.status} purged={job.purged} />
      </div>

      {/* Job Details */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-50/70 flex flex-wrap gap-x-5 gap-y-1 text-xs border-b border-slate-100 text-slate-600">
        <span>Pages: <strong className="text-slate-900">{job.pageCount}</strong></span>
        <span>Copies: <strong className="text-slate-900">{job.copies}</strong></span>
        <span>Mode: <strong className="text-slate-900">{job.printType === 'color' ? 'Full Color' : 'B&W'}</strong></span>
        <span>Layout: <strong className="text-slate-900">{job.sides === 'double' ? 'Double-Sided' : 'Single'}</strong></span>
        <span>Collected: <strong className="text-emerald-700 font-bold">₹{job.totalCost}</strong></span>
        <span className="font-mono text-slate-400">Txn: {job.transactionId}</span>
      </div>

      {/* Document Access Bar for Operator */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 bg-white">
        {job.fileData ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-blue-50/50 border border-blue-200/70 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100/70 border border-blue-200 flex items-center justify-center shrink-0 text-[#0F2942]">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-slate-900 text-xs font-bold truncate max-w-[220px] sm:max-w-xs">{job.fileName}</p>
                <p className="text-slate-500 text-[11px] font-medium">{job.fileSize || 'Attached'} • Ready for physical printing</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleViewDocument(job)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg border border-slate-300 shadow-2xs transition-colors"
                title="Preview document in browser"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                Preview
              </button>
              <button
                onClick={() => handlePrintDocument(job)}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-[#0F2942] hover:bg-[#1A365D] text-white text-xs font-bold rounded-lg shadow-2xs transition-all"
                title="Send document to printer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-300" />
                Print Document
              </button>
              <button
                onClick={() => handleDownloadDocument(job)}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-300 shadow-2xs transition-colors"
                title="Download local copy"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-medium">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>🔒 File contents permanently erased from server memory for privacy.</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {(job.status === 'pending' || job.status === 'printing' || job.status === 'ready') && (
        <div className="p-4 sm:p-5 space-y-3 bg-white">
          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            {job.status === 'pending' && (
              <button
                onClick={() => updateStatus(job.id, 'printing')}
                disabled={actionLoading[job.id]}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-[#0F2942] border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                <Printer className="w-3.5 h-3.5 text-[#0F2942]" />
                Mark as Printing
              </button>
            )}
            {job.status === 'printing' && (
              <button
                onClick={() => updateStatus(job.id, 'ready')}
                disabled={actionLoading[job.id]}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Mark Ready for Pickup
              </button>
            )}
            <button
              onClick={() => updateStatus(job.id, 'cancelled')}
              disabled={actionLoading[job.id]}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 ml-auto"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              Cancel
            </button>
          </div>

          {/* PIN Verification for Ready jobs */}
          {job.status === 'ready' && (
            <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Key className="w-4 h-4 text-amber-700" />
                <span className="text-amber-900 text-xs font-bold uppercase tracking-wider">Student Pickup PIN Verification</span>
              </div>
              {pinVerified[job.id] ? (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>PIN Verified! Hand over the printed document to student.</span>
                  </div>
                  <button
                    onClick={() => updateStatus(job.id, 'completed')}
                    disabled={actionLoading[job.id]}
                    className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-2xs disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Job & Purge File
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pinInput[job.id] || ''}
                    onChange={e => setPinInput(prev => ({ ...prev, [job.id]: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                    className="w-36 bg-white border border-amber-300 rounded-xl px-3 py-2 text-slate-900 font-bold placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-center tracking-widest font-mono"
                  />
                  <button
                    onClick={() => verifyPin(job)}
                    className="bg-[#0F2942] hover:bg-[#1A365D] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                  >
                    Verify PIN
                  </button>
                </div>
              )}
              {pinError[job.id] && (
                <p className="text-rose-600 text-xs font-semibold mt-2">{pinError[job.id]}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#0F2942] flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Operator Console</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Manage queue sequence, access documents, and verify student claim PINs.</p>
          </div>
        </div>
        <button
          onClick={fetchJobs}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl transition-colors text-xs font-semibold border border-slate-300 shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm font-medium">
          Loading operator queue board...
        </div>
      ) : (
        <>
          {/* Active Jobs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-900 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Active Work Orders ({activeJobs.length})
              </h3>
            </div>
            {activeJobs.length === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-slate-500 text-sm font-medium shadow-xs">
                No active print orders waiting in queue
              </div>
            ) : (
              <div className="space-y-3.5">
                {activeJobs.map(renderJobCard)}
              </div>
            )}
          </div>

          {/* Completed Jobs */}
          {completedJobs.length > 0 && (
            <div>
              <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-3">
                Completed & Purged Records ({completedJobs.length})
              </h3>
              <div className="space-y-2">
                {completedJobs.map(job => (
                  <div key={job.id} className="bg-white border border-slate-200/70 rounded-xl p-3.5 flex items-center justify-between text-xs text-slate-500 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{job.token}</span>
                      <span className="truncate">{job.purged ? '[Document Purged]' : job.fileName} — <strong className="text-slate-700">{job.studentName}</strong></span>
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
