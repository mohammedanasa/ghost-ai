"use client"

import { createContext, useContext } from "react"

export interface WorkspaceProject {
  id: string
  isOwner: boolean
}

interface WorkspaceContextValue {
  setWorkspaceTitle: (title: string | null) => void
  setWorkspaceProject: (project: WorkspaceProject | null) => void
  isAISidebarOpen: boolean
  toggleAISidebar: () => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  setWorkspaceTitle: () => {},
  setWorkspaceProject: () => {},
  isAISidebarOpen: false,
  toggleAISidebar: () => {},
})

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
