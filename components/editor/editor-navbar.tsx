"use client"

import { useEffect, useState } from "react"
import { PanelLeftClose, PanelLeftOpen, Share2, Bot, LayoutTemplate } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  workspaceTitle?: string | null
  isAISidebarOpen?: boolean
  onToggleAISidebar?: () => void
  onShare?: () => void
  onOpenTemplates?: () => void
  saveStatus?: SaveStatus
  onSave?: () => void
}

type SaveLabel = 'Save' | 'Saving...' | 'Saved' | 'Error'

function SaveButton({ status, onSave }: { status: SaveStatus; onSave: () => void }) {
  const [label, setLabel] = useState<SaveLabel>('Save')

  useEffect(() => {
    if (status === 'saving') {
      setLabel('Saving...')
    } else if (status === 'saved') {
      setLabel('Saved')
      const t = setTimeout(() => setLabel('Save'), 2000)
      return () => clearTimeout(t)
    } else if (status === 'error') {
      setLabel('Error')
      const t = setTimeout(() => setLabel('Save'), 2000)
      return () => clearTimeout(t)
    }
  }, [status])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onSave}
      disabled={status === 'saving'}
      className="mr-1"
    >
      {label}
    </Button>
  )
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  workspaceTitle,
  isAISidebarOpen,
  onToggleAISidebar,
  onShare,
  onOpenTemplates,
  saveStatus = 'idle',
  onSave,
}: EditorNavbarProps) {
  return (
    <header className="h-12 flex items-center justify-between px-3 bg-surface border-b border-border-default shrink-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onSidebarToggle} aria-label="Toggle sidebar">
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 text-copy-secondary" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 text-copy-secondary" />
          )}
        </Button>
        {workspaceTitle && (
          <div className="flex flex-col justify-center">
            <span className="text-sm font-medium text-copy-primary truncate max-w-xs leading-tight">
              {workspaceTitle}
            </span>
            <span className="text-xs text-copy-muted leading-tight">Workspace</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {workspaceTitle && onSave && (
          <>
            <SaveButton status={saveStatus} onSave={onSave} />
            <Button variant="ghost" size="icon" onClick={onOpenTemplates} aria-label="Starter templates">
              <LayoutTemplate className="h-5 w-5 text-copy-secondary" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2 mr-1" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAISidebar}
              aria-label="Toggle AI sidebar"
              className={cn(isAISidebarOpen && "text-ai-text")}
            >
              <Bot className="h-5 w-5" />
            </Button>
          </>
        )}
        {!workspaceTitle && <UserButton />}
      </div>
    </header>
  )
}
