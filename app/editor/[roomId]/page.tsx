import { redirect } from 'next/navigation'
import { getCurrentIdentity, getAccessibleProject } from '@/lib/project-access'
import { AccessDenied } from '@/components/editor/access-denied'
import { WorkspaceChrome } from '@/components/editor/workspace-chrome'

interface WorkspacePageProps {
  params: Promise<{ roomId: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { roomId } = await params
  const identity = await getCurrentIdentity()
  if (!identity) redirect('/sign-in')

  const project = await getAccessibleProject(roomId, identity.userId, identity.email)
  if (!project) return <AccessDenied />

  return <WorkspaceChrome projectName={project.name} />
}
