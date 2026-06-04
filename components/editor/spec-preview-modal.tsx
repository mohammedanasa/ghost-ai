"use client"

import { useEffect, useState, useCallback } from "react"
import { Download, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Markdown from "react-markdown"

interface SpecPreviewModalProps {
  projectId: string
  specId: string | null
  filename: string
  onClose: () => void
}

export function SpecPreviewModal({ projectId, specId, filename, onClose }: SpecPreviewModalProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!specId || !projectId) {
      setContent(null)
      setError(null)
      return
    }
    setContent(null)
    setError(null)
    setLoading(true)

    fetch(`/api/projects/${projectId}/specs/${specId}/download`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load spec")
        return res.text()
      })
      .then(setContent)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [specId, projectId])

  const handleDownload = useCallback(() => {
    if (!specId) return
    const a = document.createElement("a")
    a.href = `/api/projects/${projectId}/specs/${specId}/download`
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [specId, projectId, filename])

  return (
    <Dialog open={specId !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        showCloseButton
        className="max-w-3xl bg-elevated border-border-default text-copy-primary rounded-3xl"
      >
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-sm font-semibold truncate text-copy-primary">
              {filename}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleDownload}
              className="text-copy-muted hover:text-copy-primary shrink-0"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-copy-muted" />
          </div>
        )}
        {error && (
          <p className="py-12 text-center text-sm text-red-400">{error}</p>
        )}
        {content && (
          <ScrollArea className="max-h-[60vh]">
            <div className="pr-4 pb-2">
              <Markdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold text-copy-primary mb-3 mt-4 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-semibold text-copy-primary mb-2 mt-4 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-medium text-copy-primary mb-1.5 mt-3">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-sm text-copy-secondary mb-3 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-outside ml-4 mb-3 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside ml-4 mb-3 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm text-copy-secondary leading-relaxed">{children}</li>
                  ),
                  code: ({ children, className }) => {
                    const isBlock = /language-/.test(className ?? "")
                    return isBlock ? (
                      <code className="block bg-subtle rounded-lg px-3 py-2 text-xs font-mono text-copy-primary overflow-x-auto">
                        {children}
                      </code>
                    ) : (
                      <code className="bg-subtle rounded px-1 text-xs font-mono text-ai-text">
                        {children}
                      </code>
                    )
                  },
                  pre: ({ children }) => <pre className="mb-3 overflow-x-auto">{children}</pre>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-copy-primary">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-copy-secondary">{children}</em>
                  ),
                  hr: () => <hr className="border-border-default my-4" />,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-border-subtle pl-3 italic text-copy-muted mb-3">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {content}
              </Markdown>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
