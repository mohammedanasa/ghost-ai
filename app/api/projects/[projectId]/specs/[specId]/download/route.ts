import { NextResponse } from 'next/server'
import { get } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { getCurrentIdentity, getAccessibleProject } from '@/lib/project-access'

interface RouteContext {
  params: Promise<{ projectId: string; specId: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const identity = await getCurrentIdentity()
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, specId } = await params

  const accessible = await getAccessibleProject(projectId, identity.userId, identity.email)
  if (!accessible) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
    select: { projectId: true, filePath: true },
  })

  if (!spec) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (spec.projectId !== projectId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const result = await get(spec.filePath, { access: 'private' })
  if (!result?.stream) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const content = await new Response(result.stream).text()

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="spec-${specId}.md"`,
    },
  })
}
