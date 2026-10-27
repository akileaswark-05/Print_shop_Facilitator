'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, User, Printer, Minus, Plus, ChevronRight } from 'lucide-react';
import PaymentModal from './PaymentModal';
import TokenCard from './TokenCard';

interface OrderResult {
  id: string;
  token: string;
  pin: string;
  transactionId: string;
  totalCost: number;
  queuePosition: number;
  estimatedWaitMinutes: number;
}

export default function StudentOrderForm() {
  const [studentName, setStudentName] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [pageCount, setPageCount] = useState(1);
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [sides, setSides] = useState<'single' | 'double'>('single');
  const [copies, setCopies] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cost Calculation
  const baseRate = printType === 'color' ? 10 : 2;
  let totalCost = pageCount * baseRate * copies;
  if (sides === 'double') totalCost = totalCost * 0.85;
  totalCost = parseFloat(totalCost.toFixed(2));

  const processFile = (file: File) => {
    if (!file.name.match(/\.(pdf|docx|txt|png|jpg|jpeg)$/i)) {
      alert('Only PDF, DOCX, TXT, or Image files are accepted.');
      return;
    }
    setFileName(file.name);
    const sizeKB = (file.size / 1024).toFixed(1);
    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${sizeKB} KB`;
    setFileSize(sizeFormatted);

    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = () => {
    if (!studentName.trim()) return alert('Please enter your name.');
    if (!fileName) return alert('Please upload a file.');
    if (pageCount < 1) return alert('Page count must be at least 1.');
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (_method: string) => {
    setShowPayment(false);
    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentName, 
          fileName, 
          fileData, 
          fileSize, 
          pageCount, 
          printType, 
          sides, 
          copies 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setOrderResult(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        alert('Server is offline! Please ensure PowerShell is open and running "npm run dev".');
      } else {
        alert(`Failed to create print job: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Order Successfully Placed
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Your Token is Ready!</h2>
          <p className="text-slate-600 text-sm mt-1">Present your token number and secret PIN at the counter to collect your prints.</p>
        </div>
        <TokenCard
          token={orderResult.token}
          pin={orderResult.pin}
          transactionId={orderResult.transactionId}
          totalCost={orderResult.totalCost}
          queuePosition={orderResult.queuePosition}
          estimatedWaitMinutes={orderResult.estimatedWaitMinutes}
          fileName={fileName}
        />
        <button
          onClick={() => {
            setOrderResult(null);
            setStudentName('');
            setFileName('');
            setFileData('');
            setFileSize('');
            setPageCount(1);
            setPrintType('bw');
            setSides('single');
            setCopies(1);
          }}
          className="mt-6 w-full max-w-md mx-auto block text-center py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-sm rounded-xl border border-slate-300 shadow-2xs transition-colors"
        >
          ← Place Another Print Order
        </button>
      </div>
    );
  }

  return (
    <>
      {showPayment && (
        <PaymentModal
          totalCost={totalCost}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">New Print Order</h2>
          <p className="text-slate-600 text-sm mt-1">Upload your coursework, calculate accurate pricing, and skip the print shop queue.</p>
        </div>

        <div className="space-y-5">
          {/* Student Name */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <label className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F2942] flex items-center justify-center border border-blue-100">
                <User className="w-4 h-4" />
              </span>
              Student Information
            </label>
            <input
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="e.g., Alex Johnson (Roll / Dept)"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-[#0F2942] transition-all text-sm font-medium"
            />
          </div>

          {/* File Upload */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <label className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-3">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F2942] flex items-center justify-center border border-blue-100">
                <Upload className="w-4 h-4" />
              </span>
              Document Upload
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
                dragOver 
                  ? 'border-[#0F2942] bg-blue-50/50' 
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-100/50'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100/70 border border-blue-200 flex items-center justify-center text-[#0F2942]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-slate-900 font-bold text-sm truncate max-w-[240px] sm:max-w-xs">{fileName}</p>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {fileSize ? `${fileSize} • ` : ''}
                      <span className="text-blue-700 font-semibold underline">Click to change</span>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto mb-3 flex items-center justify-center border border-slate-200">
                    <Upload className="w-5 h-5 text-slate-600" />
                  </div>
                  <p className="text-slate-800 font-semibold text-sm">Drop your document here, or <span className="text-[#0F2942] underline">browse files</span></p>
                  <p className="text-slate-500 text-xs mt-1">Supports PDF, DOCX, TXT, or Image files</p>
                </>
              )}
            </div>
          </div>

          {/* Print Settings */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
            <label className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#0F2942] flex items-center justify-center border border-blue-100">
                <Printer className="w-4 h-4" />
              </span>
              Print Configuration
            </label>

            {/* Page Count */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-slate-700 text-xs font-semibold">Number of Pages</p>
                <span className="text-slate-400 text-[11px]">Enter total pages in your document</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPageCount(Math.max(1, pageCount - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={pageCount}
                  onChange={e => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-[#0F2942]"
                />
                <button
                  type="button"
                  onClick={() => setPageCount(pageCount + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Type */}
            <div>
              <p className="text-slate-700 text-xs font-semibold mb-2">Color Mode</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPrintType('bw')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    printType === 'bw'
                      ? 'border-[#0F2942] bg-blue-50/30 ring-1 ring-[#0F2942]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-sm ${printType === 'bw' ? 'text-slate-900' : 'text-slate-700'}`}>Black & White</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">₹2/page</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Standard lecture notes & assignments</p>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintType('color')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    printType === 'color'
                      ? 'border-[#0F2942] bg-amber-50/30 ring-1 ring-[#0F2942]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-sm ${printType === 'color' ? 'text-slate-900' : 'text-slate-700'}`}>Full Color</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">₹10/page</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Diagrams, certificates & presentations</p>
                </button>
              </div>
            </div>

            {/* Sides */}
            <div>
              <p className="text-slate-700 text-xs font-semibold mb-2">Print Layout</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSides('single')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    sides === 'single'
                      ? 'border-[#0F2942] bg-blue-50/30 ring-1 ring-[#0F2942]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <p className={`font-bold text-sm ${sides === 'single' ? 'text-slate-900' : 'text-slate-700'}`}>Single-Sided</p>
                  <p className="text-slate-500 text-xs mt-0.5">Standard single page sheets</p>
                </button>

                <button
                  type="button"
                  onClick={() => setSides('double')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    sides === 'double'
                      ? 'border-[#0F2942] bg-emerald-50/40 ring-1 ring-[#0F2942]'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`font-bold text-sm ${sides === 'double' ? 'text-slate-900' : 'text-slate-700'}`}>Double-Sided</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">15% OFF</span>
                  </div>
                  <p className="text-emerald-700 text-xs mt-0.5 font-medium">Eco-friendly & saves paper</p>
                </button>
              </div>
            </div>

            {/* Copies */}
            <div>
              <p className="text-slate-700 text-xs font-semibold mb-2">Number of Copies</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={copies}
                  onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-[#0F2942]"
                />
                <button
                  type="button"
                  onClick={() => setCopies(copies + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gradient-to-br from-slate-900 to-[#0F2942] text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-3">
              <span className="font-bold text-sm tracking-wide text-slate-200 uppercase">Estimated Total</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-300">₹{totalCost.toFixed(2)}</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Base rate ({pageCount} pages × ₹{baseRate} × {copies} copy)</span>
                <span>₹{(pageCount * baseRate * copies).toFixed(2)}</span>
              </div>
              {sides === 'double' && (
                <div className="flex justify-between text-emerald-300 font-semibold">
                  <span>Double-sided 15% discount applied</span>
                  <span>-₹{(pageCount * baseRate * copies * 0.15).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#0F2942] hover:bg-[#1A365D] active:scale-[0.99] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-base"
          >
            {loading ? 'Processing Order...' : 'Proceed to Digital Payment'}
            {!loading && <ChevronRight className="w-5 h-5 text-amber-300" />}
          </button>
        </div>
      </div>
    </>
  );
}
