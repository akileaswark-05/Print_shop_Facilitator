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
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg leading-none">Campus Print Shop</span>
            <p className="text-xs text-gray-400 leading-none mt-0.5">Queue & Token Estimator</p>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
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
