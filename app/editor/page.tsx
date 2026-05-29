"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOpenCreateDialog } from "@/components/editor/project-dialogs-context"

export default function EditorPage() {
  const openCreate = useOpenCreateDialog()

  return (
    <main className="h-full bg-base flex flex-col items-center justify-center gap-3">
      <h1 className="text-[1rem] font-medium text-copy-primary">
        Create a project or open an existing one
      </h1>
      <p className="text-sm text-copy-muted">
        Start a new architecture workspace, or choose a project from the sidebar.
      </p>
      <Button className="gap-2 mt-1" onClick={openCreate}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
    </main>
  )
}
