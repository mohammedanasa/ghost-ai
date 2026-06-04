import { NextResponse } from 'next/server'
import { tasks } from '@trigger.dev/sdk'
import { prisma } from '@/lib/prisma'
import { getCurrentIdentity, getAccessibleProject } from '@/lib/project-access'
import type { designAgent } from '@/trigger/design-agent'

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { prompt, roomId, projectId } = body as Record<string, unknown>
  if (typeof prompt !== 'string' || typeof roomId !== 'string' || typeof projectId !== 'string') {
    return NextResponse.json({ error: 'prompt, roomId, and projectId are required' }, { status: 400 })
  }

  const accessible = await getAccessibleProject(projectId, identity.userId, identity.email)
  if (!accessible) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const handle = await tasks.trigger<typeof designAgent>('design-agent', { prompt, roomId })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId: identity.userId,
    },
  })

  return NextResponse.json({ runId: handle.id })
}
