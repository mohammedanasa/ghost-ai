"use client"

import { createContext, useContext } from "react"

interface ProjectDialogsContextValue {
  openCreate: () => void
}

export const ProjectDialogsContext = createContext<ProjectDialogsContextValue | null>(null)

export function useOpenCreateDialog(): () => void {
  const ctx = useContext(ProjectDialogsContext)
  if (!ctx) throw new Error("useOpenCreateDialog must be used inside EditorChrome")
  return ctx.openCreate
}
