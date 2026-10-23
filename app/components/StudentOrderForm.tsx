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
      const data = await res.json();
      setOrderResult(data);
    } catch {
      alert('Failed to create print job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Order Confirmed!</h2>
          <p className="text-gray-400 mt-1">Your print job has been added to the queue</p>
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
          className="mt-6 w-full max-w-md mx-auto block text-center text-gray-400 hover:text-white text-sm transition-colors"
        >
          ← Place Another Order
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">New Print Order</h2>
          <p className="text-gray-400 mt-1">Upload your document and configure print settings</p>
        </div>

        <div className="space-y-6">
          {/* Student Name */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <label className="flex items-center gap-2 text-white font-medium mb-4">
              <User className="w-4 h-4 text-indigo-400" />
              Student Information
            </label>
            <input
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* File Upload */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <label className="flex items-center gap-2 text-white font-medium mb-4">
              <Upload className="w-4 h-4 text-indigo-400" />
              Document Upload
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'
              }`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt,.png,.jpg,.jpeg" onChange={handleFileSelect} className="hidden" />
              {fileName ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-indigo-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{fileName}</p>
                    <p className="text-gray-400 text-sm">{fileSize ? `Ready to upload (${fileSize}) • ` : ''}Click to change file</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-300 font-medium">Drop your file here or click to browse</p>
                  <p className="text-gray-500 text-sm mt-1">PDF, DOCX, TXT, or Image files</p>
                </>
              )}
            </div>
          </div>

          {/* Print Settings */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6">
            <label className="flex items-center gap-2 text-white font-medium">
              <Printer className="w-4 h-4 text-indigo-400" />
              Print Settings
            </label>

            {/* Page Count */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Number of Pages</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPageCount(Math.max(1, pageCount - 1))}
                  className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={pageCount}
                  onChange={e => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => setPageCount(pageCount + 1)}
                  className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Type */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Print Type</p>
              <div className="flex gap-3">
                {[
                  { value: 'bw', label: 'Black & White', price: '&#8377;2/page' },
                  { value: 'color', label: 'Color', price: '&#8377;10/page' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPrintType(opt.value as 'bw' | 'color')}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                      printType === opt.value ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <p className={`font-medium text-sm ${printType === opt.value ? 'text-white' : 'text-gray-300'}`}>{opt.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5" dangerouslySetInnerHTML={{ __html: opt.price }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Sides */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Sides</p>
              <div className="flex gap-3">
                {[
                  { value: 'single', label: 'Single-Sided', note: 'Standard pricing' },
                  { value: 'double', label: 'Double-Sided', note: '15% discount' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSides(opt.value as 'single' | 'double')}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                      sides === opt.value ? 'border-indigo-500 bg-indigo-600/10' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <p className={`font-medium text-sm ${sides === opt.value ? 'text-white' : 'text-gray-300'}`}>{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${opt.value === 'double' ? 'text-green-400' : 'text-gray-500'}`}>{opt.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Copies */}
            <div>
              <p className="text-gray-400 text-sm mb-2">Number of Copies</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCopies(Math.max(1, copies - 1))}
                  className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={copies}
                  onChange={e => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => setCopies(copies + 1)}
                  className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl p-6">
            <h3 className="text-white font-medium mb-4">Cost Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>{pageCount} pages × &#8377;{baseRate} × {copies} copies</span>
                <span>&#8377;{(pageCount * baseRate * copies).toFixed(2)}</span>
              </div>
              {sides === 'double' && (
                <div className="flex justify-between text-green-400">
                  <span>Double-sided discount (15%)</span>
                  <span>-&#8377;{(pageCount * baseRate * copies * 0.15).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-700 pt-2 mt-2 flex justify-between">
                <span className="text-white font-bold text-base">Total</span>
                <span className="text-indigo-400 font-black text-xl">&#8377;{totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-lg"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </>
  );
}
