import { NextResponse } from 'next/server'
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

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    specs: specs.map((s) => ({
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      filename: `spec-${s.id}.md`,
    })),
  })
}
