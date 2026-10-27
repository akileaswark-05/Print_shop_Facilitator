'use client';
import { useState } from 'react';
import { X, CreditCard, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';

interface PaymentModalProps {
  totalCost: number;
  onSuccess: (method: string) => void;
  onClose: () => void;
}

export default function PaymentModal({ totalCost, onSuccess, onClose }: PaymentModalProps) {
  const [method, setMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'done'>('form');

  const handlePay = () => {
    if (method === 'upi' && !upiId.includes('@')) return alert('Enter a valid UPI ID (e.g. student@upi)');
    if (method === 'card' && (cardNumber.length < 16 || !expiry || cvv.length < 3)) return alert('Fill in all card details.');
    setStep('processing');
    setTimeout(() => {
      setStep('done');
      setTimeout(() => onSuccess(method === 'upi' ? 'UPI' : 'Card'), 1000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="text-base font-bold text-slate-900">Campus Digital Checkout</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <>
              {/* Amount */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/70 rounded-2xl p-4 mb-5 text-center">
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Total Payable Amount</p>
                <p className="text-3xl font-black text-[#0F2942] mt-0.5">₹{totalCost.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Direct student print shop balance / UPI</p>
              </div>

              {/* Method Selector */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => setMethod('upi')}
                  className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border text-center transition-all ${
                    method === 'upi'
                      ? 'border-[#0F2942] bg-blue-50/40 text-[#0F2942] font-bold shadow-2xs ring-1 ring-[#0F2942]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-[#0F2942]" />
                  <span className="text-xs">UPI / QR</span>
                </button>
                <button
                  onClick={() => setMethod('card')}
                  className={`flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border text-center transition-all ${
                    method === 'card'
                      ? 'border-[#0F2942] bg-blue-50/40 text-[#0F2942] font-bold shadow-2xs ring-1 ring-[#0F2942]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#0F2942]" />
                  <span className="text-xs">Debit / Campus Card</span>
                </button>
              </div>

              {/* UPI Form */}
              {method === 'upi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">UPI ID (VPA)</label>
                    <input
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="e.g., student@okaxis or 9876543210@upi"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-[#0F2942] text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Card Form */}
              {method === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Card Number</label>
                    <input
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="4532 •••• •••• 8821"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-[#0F2942] text-sm tracking-wide font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Expiry</label>
                      <input
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-[#0F2942] text-sm text-center font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">CVV</label>
                      <input
                        value={cvv}
                        onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="•••"
                        type="password"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900/10 focus:border-[#0F2942] text-sm text-center font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePay}
                className="w-full mt-6 bg-[#0F2942] hover:bg-[#1A365D] text-white font-bold py-3.5 rounded-xl shadow-xs transition-all text-sm"
              >
                Simulate Payment of ₹{totalCost.toFixed(2)}
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center py-10 gap-3">
              <Loader2 className="w-10 h-10 text-[#0F2942] animate-spin" />
              <p className="text-slate-900 font-bold text-base">Authorizing Campus Payment...</p>
              <p className="text-slate-500 text-xs">Simulating bank gateway response</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center py-10 gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <p className="text-slate-900 font-bold text-base">Payment Verified Successfully!</p>
              <p className="text-slate-500 text-xs">Assigning queue token and estimated wait time...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
