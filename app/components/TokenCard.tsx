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
    <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Ticket className="w-6 h-6 text-white" />
          <span className="text-white font-bold text-lg">Queue Token Issued</span>
        </div>
        <div className="text-center">
          <p className="text-indigo-200 text-sm">Your Token Number</p>
          <p className="text-5xl font-black text-white mt-1 tracking-wider">{token}</p>
        </div>
      </div>

      {/* Queue Status */}
      <div className="bg-gray-800/60 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300">
          <Hash className="w-4 h-4 text-indigo-400" />
          <span className="text-sm">{queuePosition} job{queuePosition !== 1 ? 's' : ''} ahead of you</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">~{estimatedWaitMinutes} min wait</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">File</span>
          <span className="text-white text-sm font-medium truncate max-w-[200px]">{fileName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Transaction ID</span>
          <span className="text-white text-sm font-mono">{transactionId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Amount Paid</span>
          <span className="text-green-400 font-bold">&#8377;{totalCost.toFixed(2)}</span>
        </div>

        {/* PIN Section */}
        <div className="bg-gray-800 border border-yellow-500/30 rounded-xl p-4 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 text-sm font-medium">Secret Claim PIN</span>
            <span className="text-xs text-gray-500">(Show to operator at pickup)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black tracking-[0.4em] text-white">
              {pinRevealed ? pin : '••••'}
            </span>
            <button
              onClick={() => setPinRevealed(!pinRevealed)}
              className="text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-3 py-1.5 rounded-lg transition-colors border border-yellow-500/30"
            >
              {pinRevealed ? 'Hide' : 'Reveal'} PIN
            </button>
          </div>
        </div>

        {/* Copy Token */}
        <button
          onClick={copyToken}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-3 rounded-xl transition-colors border border-gray-700"
        >
          {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          <span className="text-sm">{copied ? 'Token Copied!' : 'Copy Token Number'}</span>
        </button>
      </div>

      <div className="bg-red-500/10 border-t border-red-500/20 px-6 py-3">
        <p className="text-red-300 text-xs text-center">
          🔒 Your document will be auto-purged from our servers immediately after pickup for your privacy.
        </p>
      </div>
    </div>
  );
}
