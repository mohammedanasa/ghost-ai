import { NextResponse } from 'next/server'
import { auth as triggerAuth } from '@trigger.dev/sdk'
import { prisma } from '@/lib/prisma'
import { getCurrentIdentity } from '@/lib/project-access'

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { runId } = body as Record<string, unknown>
  if (typeof runId !== 'string') {
    return NextResponse.json({ error: 'runId is required' }, { status: 400 })
  }

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } })
  if (!taskRun || taskRun.userId !== identity.userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const publicToken = await triggerAuth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: '1h',
  })

  return NextResponse.json({ token: publicToken })
}
