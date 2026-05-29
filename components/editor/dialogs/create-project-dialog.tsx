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

interface CreateProjectDialogProps {
  open: boolean
  name: string
  roomIdPreview: string
  onNameChange: (name: string) => void
  onClose: () => void
  onSubmit: () => void
  isLoading: boolean
}

export function CreateProjectDialog({
  open,
  name,
  roomIdPreview,
  onNameChange,
  onClose,
  onSubmit,
  isLoading,
}: CreateProjectDialogProps) {
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
            onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onSubmit() }}
            autoFocus
          />
          <p className="text-xs text-copy-muted px-0.5">
            Room ID:{" "}
            <span className="text-copy-secondary">
              {roomIdPreview || "your-project-room-id"}
            </span>
          </p>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={!name.trim() || isLoading} onClick={onSubmit}>
            {isLoading ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
