"use client"

import { createContext, useContext } from "react"
import type { CanvasNode, CanvasEdge } from "@/types/canvas"

export interface WorkspaceProject {
  id: string
  isOwner: boolean
}

export interface TemplatePayload {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

interface WorkspaceContextValue {
  setWorkspaceTitle: (title: string | null) => void
  setWorkspaceProject: (project: WorkspaceProject | null) => void
  isAISidebarOpen: boolean
  toggleAISidebar: () => void
  pendingTemplateImport: TemplatePayload | null
  setPendingTemplateImport: (payload: TemplatePayload | null) => void
}

export const WorkspaceContext = createContext<WorkspaceContextValue>({
  setWorkspaceTitle: () => {},
  setWorkspaceProject: () => {},
  isAISidebarOpen: false,
  toggleAISidebar: () => {},
  pendingTemplateImport: null,
  setPendingTemplateImport: () => {},
})

export function useWorkspace() {
  return useContext(WorkspaceContext)
}
