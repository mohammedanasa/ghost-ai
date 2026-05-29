"use client"

import { PanelLeftClose, PanelLeftOpen, Share2, Bot } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  workspaceTitle?: string | null
  isAISidebarOpen?: boolean
  onToggleAISidebar?: () => void
  onShare?: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  workspaceTitle,
  isAISidebarOpen,
  onToggleAISidebar,
  onShare,
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
          <span className="text-sm font-medium text-copy-primary truncate max-w-xs">
            {workspaceTitle}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {workspaceTitle && (
          <>
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
        <UserButton />
      </div>
    </header>
  )
}
