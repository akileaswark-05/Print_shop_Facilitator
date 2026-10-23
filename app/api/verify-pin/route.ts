import { NextRequest, NextResponse } from 'next/server';
import { getJobs } from '@/app/lib/store';

export async function POST(req: NextRequest) {
  const { token, pin } = await req.json();
  const jobs = getJobs();
  const job = jobs.find(j => j.token === token && j.pin === pin);
  if (!job) {
    return NextResponse.json({ success: false, message: 'Invalid token or PIN' }, { status: 400 });
  }
  return NextResponse.json({ success: true, jobId: job.id, status: job.status });
}
