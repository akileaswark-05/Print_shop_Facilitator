export type JobStatus = 'pending' | 'printing' | 'ready' | 'completed' | 'cancelled';

export interface PrintJob {
  id: string;
  token: string;
  studentName: string;
  fileName: string;
  fileData?: string | null;
  fileSize?: string | null;
  pageCount: number;
  printType: 'bw' | 'color';
  sides: 'single' | 'double';
  copies: number;
  totalCost: number;
  transactionId: string;
  pin: string;
  status: JobStatus;
  createdAt: string;
  queuePosition: number;
  estimatedWaitMinutes: number;
  purged: boolean;
}

// Global in-memory store (persists for the server process lifetime)
declare global {
  // eslint-disable-next-line no-var
  var __printJobs: PrintJob[] | undefined;
  // eslint-disable-next-line no-var
  var __tokenCounter: number | undefined;
}

if (!global.__printJobs) global.__printJobs = [];
if (!global.__tokenCounter) global.__tokenCounter = 100;

export function getJobs(): PrintJob[] {
  return global.__printJobs!;
}

export function addJob(job: PrintJob): void {
  global.__printJobs!.push(job);
}

export function updateJob(id: string, updates: Partial<PrintJob>): PrintJob | null {
  const jobs = global.__printJobs!;
  const idx = jobs.findIndex(j => j.id === id);
  if (idx === -1) return null;
  jobs[idx] = { ...jobs[idx], ...updates };
  return jobs[idx];
}

export function getNextToken(): string {
  const num = global.__tokenCounter!++;
  return `A-${num}`;
}

export function computeQueueMetrics(jobs: PrintJob[]): { position: number; waitMinutes: number }[] {
  // Only pending jobs count toward wait time
  const pending = jobs.filter(j => j.status === 'pending');
  let cumulativePages = 0;
  return jobs.map(job => {
    if (job.status !== 'pending') return { position: 0, waitMinutes: 0 };
    const pos = pending.indexOf(job) + 1;
    const pagesAhead = cumulativePages;
    cumulativePages += job.pageCount * job.copies;
    const waitMinutes = Math.round((pagesAhead * 3) / 60 * 10) / 10;
    return { position: pos, waitMinutes };
  });
}
