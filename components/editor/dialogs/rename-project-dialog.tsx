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

interface RenameProjectDialogProps {
  open: boolean
  currentName: string
  name: string
  onNameChange: (name: string) => void
  onClose: () => void
}

export function RenameProjectDialog({
  open,
  currentName,
  name,
  onNameChange,
  onClose,
}: RenameProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Rename Project</DialogTitle>
          <DialogDescription>
            Current name: <span className="text-copy-secondary">{currentName}</span>
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="New project name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onClose() }}
          autoFocus
        />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button disabled={!name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
