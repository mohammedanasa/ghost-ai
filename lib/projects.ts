import { prisma } from './prisma'

export interface ProjectData {
  id: string
  name: string
}

export async function getOwnedProjects(userId: string): Promise<ProjectData[]> {
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true },
  })
}

export async function getSharedProjects(userEmail: string): Promise<ProjectData[]> {
  if (!userEmail) return []
  const collabs = await prisma.projectCollaborator.findMany({
    where: { email: userEmail },
    select: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return collabs.map((c) => c.project)
}
