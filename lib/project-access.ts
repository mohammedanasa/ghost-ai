import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './prisma'

export async function getCurrentIdentity(): Promise<{ userId: string; email: string } | null> {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress?.toLowerCase()
  if (!email) return null
  return { userId, email }
}

// Returns both the identity (userId/email) and the full Clerk user object
export async function getCurrentIdentityWithUser(): Promise<
  | { userId: string; email: string; user: Awaited<ReturnType<typeof currentUser>> }
  | null
> {
  const { userId } = await auth()
  if (!userId) return null
  const user = await currentUser()
  const email = user?.emailAddresses[0]?.emailAddress
  if (!email) return null
  return { userId, email, user }
}

export async function getAccessibleProject(
  projectId: string,
  userId: string,
  email: string,
): Promise<{ id: string; name: string; isOwner: boolean } | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: {
        where: { email },
        select: { id: true },
      },
    },
  })
  if (!project) return null
  const isOwner = project.ownerId === userId
  if (!isOwner && project.collaborators.length === 0) return null
  return { id: project.id, name: project.name, isOwner }
}
