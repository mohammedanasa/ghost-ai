"use client"

import { useState, useEffect, useCallback } from "react"
import { Link2, X, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Collaborator {
  id: string
  email: string
  name: string | null
  imageUrl: string | null
}

interface ShareDialogProps {
  projectId: string
  isOwner: boolean
  open: boolean
  onClose: () => void
}

export function ShareDialog({ projectId, isOwner, open, onClose }: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const fetchCollaborators = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`)
      if (res.ok) {
        const data: Collaborator[] = await res.json()
        setCollaborators(data)
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (open) {
      fetchCollaborators()
    }
  }, [open, fetchCollaborators])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      })
      if (!res.ok) {
        let errorMessage = "Failed to invite"
        try {
          const contentType = res.headers.get("content-type")
          if (contentType && contentType.includes("application/json")) {
            const data: { error?: string } = await res.json()
            errorMessage = data.error ?? errorMessage
          } else {
            errorMessage = await res.text() || errorMessage
          }
        } catch {
          // Use default error message
        }
        setError(errorMessage)
        return
      }
      setInviteEmail("")
      await fetchCollaborators()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(collaboratorId: string) {
    setRemovingId(collaboratorId)
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators/${collaboratorId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId))
      } else {
        console.error("Failed to remove collaborator")
      }
    } catch (err) {
      console.error("Error removing collaborator:", err)
    } finally {
      setRemovingId(null)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/editor/${projectId}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
        </DialogHeader>

        {isOwner && (
          <form onSubmit={handleInvite} className="flex gap-2">
            <Input
              type="email"
              placeholder="Invite by email"
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setError(null) }}
              disabled={inviting}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={inviting || !inviteEmail.trim()}>
              <UserPlus className="h-4 w-4 mr-1" />
              {inviting ? "Inviting…" : "Invite"}
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-state-error">{error}</p>}

        <div className="space-y-1">
          {loading ? (
            <p className="text-sm text-copy-muted py-2">Loading…</p>
          ) : collaborators.length === 0 ? (
            <p className="text-sm text-copy-muted py-2">No collaborators yet.</p>
          ) : (
            collaborators.map((collab) => (
              <div key={collab.id} className="flex items-center gap-3 py-1.5">
                {collab.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={collab.imageUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-subtle flex items-center justify-center text-xs text-copy-muted uppercase shrink-0">
                    {(collab.name ?? collab.email).charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {collab.name && (
                    <p className="text-sm text-copy-primary truncate">{collab.name}</p>
                  )}
                  <p className={`truncate ${collab.name ? "text-xs text-copy-muted" : "text-sm text-copy-primary"}`}>
                    {collab.email}
                  </p>
                </div>
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => handleRemove(collab.id)}
                    disabled={removingId === collab.id}
                    aria-label="Remove collaborator"
                  >
                    <X className="h-4 w-4 text-copy-muted" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-border-default">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyLink}>
            <Link2 className="h-4 w-4" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
