import { NextRequest, NextResponse } from 'next/server';
import { updateJob, JobStatus } from '@/app/lib/store';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const { status } = body as { status: JobStatus };

  const updates: Record<string, unknown> = { status };

  // Auto-purge on completion
  if (status === 'completed') {
    updates.purged = true;
    updates.fileName = '[PURGED]';
    updates.pin = '****';
  }

  const updated = updateJob(id, updates as Parameters<typeof updateJob>[1]);
  if (!updated) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
