import { NextResponse } from 'next/server'
import { tasks } from '@trigger.dev/sdk'
import { prisma } from '@/lib/prisma'
import { getCurrentIdentity, getAccessibleProject } from '@/lib/project-access'
import type { generateSpec } from '@/trigger/generate-spec'

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: unknown = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { roomId, chatHistory, nodes, edges } = body as Record<string, unknown>
  if (typeof roomId !== 'string') {
    return NextResponse.json({ error: 'roomId is required' }, { status: 400 })
  }

  const project = await getAccessibleProject(roomId, identity.userId, identity.email)
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const handle = await tasks.trigger<typeof generateSpec>('generate-spec', {
    projectId: project.id,
    roomId,
    chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
    nodes: Array.isArray(nodes) ? nodes : [],
    edges: Array.isArray(edges) ? edges : [],
  })

  await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId: project.id,
      userId: identity.userId,
    },
  })

  return NextResponse.json({ runId: handle.id })
}
