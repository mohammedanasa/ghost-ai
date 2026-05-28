"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
}

export function EditorNavbar({ isSidebarOpen, onSidebarToggle }: EditorNavbarProps) {
  return (
    <header className="h-12 flex items-center justify-between px-3 bg-surface border-b border-border-default">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onSidebarToggle} aria-label="Toggle sidebar">
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-copy-secondary" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-copy-secondary" />
          )}
        </Button>
      </div>
      <div className="flex-1" />
      <div className="flex items-center">
          <UserButton />
        </div>
    </header>
  )
}
