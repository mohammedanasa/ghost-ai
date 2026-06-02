"use client"

import { useEffect } from "react"
import { useWorkspace } from "./workspace-context"
import { CanvasRoom } from "./canvas-room"

interface WorkspaceChromeProps {
  projectId: string
  projectName: string
  isOwner: boolean
  roomId: string
}

export function WorkspaceChrome({ projectId, projectName, isOwner, roomId }: WorkspaceChromeProps) {
  const { setWorkspaceTitle, setWorkspaceProject } = useWorkspace()

  useEffect(() => {
    setWorkspaceTitle(projectName)
    setWorkspaceProject({ id: projectId, isOwner })
    return () => {
      setWorkspaceTitle(null)
      setWorkspaceProject(null)
    }
  }, [projectId, projectName, isOwner, setWorkspaceTitle, setWorkspaceProject])

  return (
    <div className="h-full w-full bg-base">
      <CanvasRoom roomId={roomId} />
    </div>
  )
}
