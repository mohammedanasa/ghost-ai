"use client"

import { createContext, useContext } from "react"

interface WorkspaceContextValue {
  setWorkspaceTitle: (title: string | null) => void
  isAISidebarOpen: boolean
  toggleAISidebar: () => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  setWorkspaceTitle: () => {},
  isAISidebarOpen: false,
  toggleAISidebar: () => {},
})

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
