"use client"

import { useEffect } from "react"
import { useWorkspace } from "./workspace-context"

interface WorkspaceChromeProps {
  projectName: string
}

export function WorkspaceChrome({ projectName }: WorkspaceChromeProps) {
  const { setWorkspaceTitle, isAISidebarOpen } = useWorkspace()

  useEffect(() => {
    setWorkspaceTitle(projectName)
    return () => setWorkspaceTitle(null)
  }, [projectName, setWorkspaceTitle])

  return (
    <div className="relative h-full min-h-0">
      <div className="h-full bg-base flex items-center justify-center">
        <p className="text-sm text-copy-muted">Canvas coming soon.</p>
      </div>

      {isAISidebarOpen && (
        <aside className="absolute top-0 right-0 h-full w-80 border-l border-border-default bg-elevated flex flex-col">
          <div className="h-12 flex items-center px-4 border-b border-border-default shrink-0">
            <span className="text-sm font-medium text-copy-primary">AI Assistant</span>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-copy-muted">AI chat coming soon.</p>
          </div>
        </aside>
      )}
    </div>
  )
}
