"use client"

import { useState } from "react"

export type DialogType = "create" | "rename" | "delete" | null

export interface DialogTarget {
  id: string
  name: string
}

export interface UseProjectDialogsReturn {
  openDialog: DialogType
  target: DialogTarget | null
  formName: string
  isLoading: boolean
  setFormName: (name: string) => void
  openCreate: () => void
  openRename: (project: DialogTarget) => void
  openDelete: (project: DialogTarget) => void
  close: () => void
}

export function useProjectDialogs(): UseProjectDialogsReturn {
  const [openDialog, setOpenDialog] = useState<DialogType>(null)
  const [target, setTarget] = useState<DialogTarget | null>(null)
  const [formName, setFormName] = useState("")
  const isLoading = false

  function openCreate() {
    setFormName("")
    setTarget(null)
    setOpenDialog("create")
  }

  function openRename(project: DialogTarget) {
    setFormName(project.name)
    setTarget(project)
    setOpenDialog("rename")
  }

  function openDelete(project: DialogTarget) {
    setTarget(project)
    setOpenDialog("delete")
  }

  function close() {
    setOpenDialog(null)
  }

  return {
    openDialog,
    target,
    formName,
    isLoading,
    setFormName,
    openCreate,
    openRename,
    openDelete,
    close,
  }
}
