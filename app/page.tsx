'use client';
import { useState } from 'react';
import Navbar from './components/Navbar';
import StudentOrderForm from './components/StudentOrderForm';
import QueueStatus from './components/QueueStatus';
import OperatorPanel from './components/OperatorPanel';

type Tab = 'order' | 'queue' | 'operator';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('order');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-blue-50/30 text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main>
        {activeTab === 'order' && <StudentOrderForm />}
        {activeTab === 'queue' && <QueueStatus />}
        {activeTab === 'operator' && <OperatorPanel />}
      </main>
    </div>
  );
}
