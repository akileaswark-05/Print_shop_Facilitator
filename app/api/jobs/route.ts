import { NextRequest, NextResponse } from 'next/server';
import { getJobs, addJob, getNextToken, PrintJob } from '@/app/lib/store';
import { randomUUID } from 'crypto';

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function generateTransactionId(): string {
  return 'TXN' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
}

export async function GET() {
  const jobs = getJobs();
  // Compute wait times dynamically
  const pending = jobs.filter(j => j.status === 'pending');
  let cumulativePages = 0;
  const result = jobs.map(job => {
    if (job.status === 'pending') {
      const pos = pending.indexOf(job) + 1;
      const pagesAhead = cumulativePages;
      cumulativePages += job.pageCount * job.copies;
      const waitMinutes = parseFloat(((pagesAhead * 3) / 60).toFixed(1));
      return { ...job, queuePosition: pos, estimatedWaitMinutes: waitMinutes };
    }
    return job;
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentName, fileName, pageCount, printType, sides, copies } = body;

  // Calculate cost
  const baseRate = printType === 'color' ? 10 : 2;
  let cost = pageCount * baseRate * copies;
  if (sides === 'double') cost = cost * 0.85;
  cost = parseFloat(cost.toFixed(2));

  const token = getNextToken();
  const pin = generatePin();
  const transactionId = generateTransactionId();

  // Compute queue position for new job
  const jobs = getJobs();
  const pendingJobs = jobs.filter(j => j.status === 'pending');
  const pagesAheadTotal = pendingJobs.reduce((sum, j) => sum + j.pageCount * j.copies, 0);
  const waitMinutes = parseFloat(((pagesAheadTotal * 3) / 60).toFixed(1));
  const queuePos = pendingJobs.length + 1;

  const job: PrintJob = {
    id: randomUUID(),
    token,
    studentName,
    fileName,
    pageCount,
    printType,
    sides,
    copies,
    totalCost: cost,
    transactionId,
    pin,
    status: 'pending',
    createdAt: new Date().toISOString(),
    queuePosition: queuePos,
    estimatedWaitMinutes: waitMinutes,
    purged: false,
  };

  addJob(job);

  return NextResponse.json({
    id: job.id,
    token: job.token,
    pin: job.pin,
    transactionId: job.transactionId,
    totalCost: job.totalCost,
    queuePosition: job.queuePosition,
    estimatedWaitMinutes: job.estimatedWaitMinutes,
  }, { status: 201 });
}
