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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 'form' && (
            <>
              {/* Amount */}
              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-xl p-4 mb-6 text-center">
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-3xl font-bold text-white mt-1">&#8377;{totalCost.toFixed(2)}</p>
              </div>

              {/* Method Selector */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setMethod('upi')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    method === 'upi' ? 'border-indigo-500 bg-indigo-600/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="text-sm font-medium">UPI</span>
                </button>
                <button
                  onClick={() => setMethod('card')}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                    method === 'card' ? 'border-indigo-500 bg-indigo-600/10 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm font-medium">Card</span>
                </button>
              </div>

              {/* UPI Form */}
              {method === 'upi' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">UPI ID</label>
                    <input
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Card Form */}
              {method === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Card Number</label>
                    <input
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-400 mb-1">Expiry</label>
                      <input
                        value={expiry}
                        onChange={e => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="w-28">
                      <label className="block text-sm text-gray-400 mb-1">CVV</label>
                      <input
                        value={cvv}
                        onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="123"
                        type="password"
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handlePay}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                Pay &#8377;{totalCost.toFixed(2)}
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
              <p className="text-white font-medium">Processing Payment...</p>
              <p className="text-gray-400 text-sm">Please do not close this window</p>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center py-12 gap-4">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
              <p className="text-white font-medium">Payment Successful!</p>
              <p className="text-gray-400 text-sm">Generating your queue token...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
