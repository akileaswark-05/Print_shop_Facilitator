'use client';
import { Ticket, Key, Clock, Hash, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';

interface TokenCardProps {
  token: string;
  pin: string;
  transactionId: string;
  totalCost: number;
  queuePosition: number;
  estimatedWaitMinutes: number;
  fileName: string;
}

export default function TokenCard({
  token, pin, transactionId, totalCost, queuePosition, estimatedWaitMinutes, fileName
}: TokenCardProps) {
  const [pinRevealed, setPinRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-lg max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0F2942] to-[#1E3A8A] p-6 text-white text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Ticket className="w-5 h-5 text-amber-300" />
          <span className="text-slate-200 font-bold text-xs uppercase tracking-widest">Campus Print Token</span>
        </div>
        <p className="text-slate-300 text-xs font-medium">Your Queue Identification</p>
        <p className="text-5xl font-black text-amber-300 mt-1 tracking-wider">{token}</p>
      </div>

      {/* Queue Status */}
      <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Hash className="w-4 h-4 text-[#0F2942]" />
          <span>{queuePosition} job{queuePosition !== 1 ? 's' : ''} ahead</span>
        </div>
        <div className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>~{estimatedWaitMinutes} min wait</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-3.5 text-sm">
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 text-xs font-medium">Document</span>
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{fileName}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 text-xs font-medium">Txn Reference</span>
          <span className="text-slate-700 font-mono text-xs font-semibold">{transactionId}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-slate-100">
          <span className="text-slate-500 text-xs font-medium">Amount Paid</span>
          <span className="text-emerald-700 font-extrabold text-base">₹{totalCost.toFixed(2)}</span>
        </div>

        {/* PIN Section */}
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-700" />
              <span className="text-amber-900 text-xs font-bold uppercase tracking-wider">Secret Claim PIN</span>
            </div>
            <span className="text-[11px] text-amber-700/80 font-medium">Required at counter</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black tracking-[0.35em] text-slate-900">
              {pinRevealed ? pin : '••••'}
            </span>
            <button
              onClick={() => setPinRevealed(!pinRevealed)}
              className="text-xs bg-white hover:bg-amber-100/70 text-amber-900 font-bold px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs transition-colors"
            >
              {pinRevealed ? 'Hide' : 'Reveal'} PIN
            </button>
          </div>
        </div>

        {/* Copy Token */}
        <button
          onClick={copyToken}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl transition-colors border border-slate-200 text-xs"
        >
          {copied ? <CheckCheck className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          <span>{copied ? 'Token Number Copied!' : 'Copy Token Number'}</span>
        </button>
      </div>

      <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-3">
        <p className="text-slate-500 text-[11px] text-center font-medium leading-relaxed">
          🔒 Secure file auto-purge: Uploaded file data is wiped immediately after operator verifies your claim PIN.
        </p>
      </div>
    </div>
  );
}
