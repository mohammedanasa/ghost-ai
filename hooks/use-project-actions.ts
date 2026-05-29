"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export type DialogType = "create" | "rename" | "delete" | null

export interface DialogTarget {
  id: string
  name: string
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 7)
}

export function useProjectActions(activeProjectId?: string) {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState<DialogType>(null)
  const [target, setTarget] = useState<DialogTarget | null>(null)
  const [formName, setFormName] = useState("")
  const [roomIdSuffix, setRoomIdSuffix] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const roomIdPreview = formName.trim()
    ? `${toSlug(formName)}-${roomIdSuffix}`
    : ""

  function openCreate() {
    setFormName("")
    setTarget(null)
    setRoomIdSuffix(shortSuffix())
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

  async function submitCreate() {
    if (!formName.trim() || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      })
      if (!res.ok) throw new Error("Failed to create project")
      const project = (await res.json()) as { id: string }
      close()
      router.push(`/editor/${project.id}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function submitRename() {
    if (!target || !formName.trim() || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName.trim() }),
      })
      if (!res.ok) throw new Error("Failed to rename project")
      close()
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  async function submitDelete() {
    if (!target || isLoading) return
    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${target.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete project")
      close()
      if (activeProjectId === target.id) {
        router.push("/editor")
      } else {
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    openDialog,
    target,
    formName,
    roomIdPreview,
    isLoading,
    setFormName,
    openCreate,
    openRename,
    openDelete,
    close,
    submitCreate,
    submitRename,
    submitDelete,
  }
}
