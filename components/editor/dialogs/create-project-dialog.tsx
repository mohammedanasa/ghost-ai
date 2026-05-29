"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

interface CreateProjectDialogProps {
  open: boolean
  name: string
  onNameChange: (name: string) => void
  onClose: () => void
}

export function CreateProjectDialog({
  open,
  name,
  onNameChange,
  onClose,
}: CreateProjectDialogProps) {
  const slug = toSlug(name)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
          <DialogDescription>Name your architecture workspace.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input
            placeholder="Project name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            autoFocus
          />
          <p className="text-xs text-copy-muted px-0.5">
            Slug:{" "}
            <span className="text-copy-secondary">
              {slug || "your-project-slug"}
            </span>
          </p>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={!name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
