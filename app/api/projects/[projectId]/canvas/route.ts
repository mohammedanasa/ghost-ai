import { NextResponse } from 'next/server'
import { put, get } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { getCurrentIdentity, getAccessibleProject } from '@/lib/project-access'

interface RouteContext {
  params: Promise<{ projectId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const identity = await getCurrentIdentity()
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await params
  const accessible = await getAccessibleProject(projectId, identity.userId, identity.email)
  if (!accessible) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  })

  if (!project?.canvasJsonPath) {
    return NextResponse.json({ nodes: [], edges: [] })
  }

  const result = await get(project.canvasJsonPath, { access: 'private' })
  if (!result?.stream) return NextResponse.json({ nodes: [], edges: [] })

  const canvas = await new Response(result.stream).json()
  return NextResponse.json(canvas)
}

export async function PUT(request: Request, { params }: RouteContext) {
  const identity = await getCurrentIdentity()
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await params
  const accessible = await getAccessibleProject(projectId, identity.userId, identity.email)
  if (!accessible) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body: unknown = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const blob = await put(`canvas/${projectId}.json`, JSON.stringify(body), {
    access: 'private',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
  })

  await prisma.project.update({
    where: { id: projectId },
    data: { canvasJsonPath: blob.url },
  })

  return NextResponse.json({ url: blob.url })
}
