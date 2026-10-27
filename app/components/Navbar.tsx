'use client';
import { Printer } from 'lucide-react';

type Tab = 'order' | 'queue' | 'operator';

export default function Navbar({ activeTab, setActiveTab }: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: 'order',    label: 'Student Order' },
    { id: 'queue',    label: 'Live Queue Status' },
    { id: 'operator', label: 'Operator Portal' },
  ];
  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F2942] to-[#1E3A8A] flex items-center justify-center shadow-sm text-white">
            <Printer className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight">Campus Print Shop</span>
              <span className="bg-blue-50 text-[#1E3A8A] border border-blue-200/60 text-[11px] font-semibold px-2 py-0.5 rounded-full">FastTrack</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Digital Queue Token & Pick-up Estimator</p>
          </div>
        </div>
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200/80">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
