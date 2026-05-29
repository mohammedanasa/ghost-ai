import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteContext {
  params: Promise<{ projectId: string }>
}

async function getCallerIdentity() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email = (user?.emailAddresses[0]?.emailAddress || '').toLowerCase()
  if (!email) return null
  return { userId, email }
}

export async function GET(_request: Request, { params }: RouteContext) {
  const identity = await getCallerIdentity()
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      collaborators: {
        where: { email: identity.email },
        select: { id: true },
      },
    },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const isOwner = project.ownerId === identity.userId
  if (!isOwner && project.collaborators.length === 0) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  })

  const clerk = await clerkClient()

  let clerkUsersMap: Map<string, { name: string | null; imageUrl: string | null }> = new Map()
  try {
    const emails = collaborators.map(c => c.email)
    const result = await clerk.users.getUserList({ emailAddress: emails })
    result.data.forEach((clerkUser) => {
      const userEmail = clerkUser.emailAddresses[0]?.emailAddress?.toLowerCase()
      if (userEmail) {
        const name = (`${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || clerkUser.username || null)
        clerkUsersMap.set(userEmail, { name, imageUrl: clerkUser.imageUrl ?? null })
      }
    })
  } catch {
    // On batch failure, use fallback for all collaborators
  }

  const enriched = collaborators.map((collab) => {
    const clerkData = clerkUsersMap.get(collab.email)
    return {
      id: collab.id,
      email: collab.email,
      name: clerkData?.name ?? null,
      imageUrl: clerkData?.imageUrl ?? null,
    }
  })

  return NextResponse.json(enriched)
}

export async function POST(request: Request, { params }: RouteContext) {
  const identity = await getCallerIdentity()
  if (!identity) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (project.ownerId !== identity.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  let inviteEmail =
    typeof body === 'object' && body !== null && 'email' in body && typeof (body as { email: unknown }).email === 'string'
      ? (body as { email: string }).email.trim().toLowerCase()
      : ''

  if (!inviteEmail) return NextResponse.json({ error: 'email is required' }, { status: 400 })

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(inviteEmail)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  inviteEmail = inviteEmail.toLowerCase().trim()

  if (inviteEmail === identity.email) {
    return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })
  }

  const collab = await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email: inviteEmail } },
    create: { projectId, email: inviteEmail },
    update: {},
  })

  return NextResponse.json(collab, { status: 201 })
}
