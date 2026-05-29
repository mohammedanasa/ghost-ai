"use client"

import { useEffect } from "react"
import { Ghost, Sparkles } from "lucide-react"
import { useWorkspace } from "./workspace-context"
import { CanvasRoom } from "./canvas-room"

interface WorkspaceChromeProps {
  projectId: string
  projectName: string
  isOwner: boolean
  roomId: string
}

export function WorkspaceChrome({ projectId, projectName, isOwner, roomId }: WorkspaceChromeProps) {
  const { setWorkspaceTitle, setWorkspaceProject, isAISidebarOpen } = useWorkspace()

  useEffect(() => {
    setWorkspaceTitle(projectName)
    setWorkspaceProject({ id: projectId, isOwner })
    return () => {
      setWorkspaceTitle(null)
      setWorkspaceProject(null)
    }
  }, [projectId, projectName, isOwner, setWorkspaceTitle, setWorkspaceProject])

  return (
    <div className="relative h-full min-h-0">
      <div className="h-full w-full bg-base">
        <CanvasRoom roomId={roomId} />
      </div>

      <aside
        className={[
          "absolute top-0 right-0 bottom-0 z-40 w-80",
          "pt-2 pr-2 pb-2",
          "transition-transform duration-300 ease-in-out",
          isAISidebarOpen ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border-default bg-elevated">
          <div className="h-12 flex items-center justify-between px-4 border-b border-border-default shrink-0">
            <div className="flex flex-col justify-center">
              <span className="text-sm font-medium text-copy-primary leading-tight">AI Copilot</span>
              <span className="text-xs text-copy-muted leading-tight">Placeholder panel</span>
            </div>
            <Sparkles className="h-4 w-4 text-copy-muted" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            <div className="rounded-lg border border-border-default bg-base p-4 flex gap-3">
              <Ghost className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-copy-primary">Chat surface pending</p>
                <p className="text-xs text-copy-muted mt-1">
                  The toggle is wired. Messaging and generation are intentionally out of scope here.
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border-default bg-base p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-copy-muted mb-2">Future Hooks</p>
              <p className="text-xs text-copy-muted">
                Prompt composer, run status, and architecture guidance will attach to this sidebar.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
