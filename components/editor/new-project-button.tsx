"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOpenCreateDialog } from "@/components/editor/project-dialogs-context"

export function NewProjectButton() {
  const openCreate = useOpenCreateDialog()
  return (
    <Button className="gap-2 mt-1" onClick={openCreate}>
      <Plus className="h-4 w-4" />
      New Project
    </Button>
  )
}
