"use client"

import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react"
import { Bot, X, Send, FileText, Download, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useEventListener, useStorage, useMutation, useSelf, useRoom } from "@liveblocks/react"
import { LiveObject } from "@liveblocks/client"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import { AiStatusPayloadSchema, ChatMessageSchema, type ChatMessage } from "@/types/tasks"
import { useWorkspace } from "./workspace-context"
import { SpecPreviewModal } from "./spec-preview-modal"

interface SpecItem {
  id: string
  createdAt: string
  filename: string
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch {
    return ""
  }
}

// Mounts only when runId + publicToken are real — keeps useRealtimeRun away from empty credentials.
function RunTracker({
  runId,
  publicToken,
  onComplete,
}: {
  runId: string
  publicToken: string
  onComplete: (success: boolean) => void
}) {
  const { run } = useRealtimeRun(runId, { accessToken: publicToken })
  const handledRef = useRef(false)

  useEffect(() => {
    if (!run || handledRef.current) return
    const TERMINAL = ["COMPLETED", "FAILED", "CANCELED", "CRASHED", "TIMED_OUT", "INTERRUPTED", "SYSTEM_FAILURE"]
    if (!TERMINAL.includes(run.status)) return
    handledRef.current = true
    onComplete(run.status === "COMPLETED")
  }, [run?.status, onComplete])

  return null
}

// Tracks a spec generation run; separate component to isolate useRealtimeRun.
function SpecRunTracker({
  runId,
  publicToken,
  onComplete,
}: {
  runId: string
  publicToken: string
  onComplete: (success: boolean) => void
}) {
  const { run } = useRealtimeRun(runId, { accessToken: publicToken })
  const handledRef = useRef(false)

  useEffect(() => {
    if (!run || handledRef.current) return
    const TERMINAL = ["COMPLETED", "FAILED", "CANCELED", "CRASHED", "TIMED_OUT", "INTERRUPTED", "SYSTEM_FAILURE"]
    if (!TERMINAL.includes(run.status)) return
    handledRef.current = true
    onComplete(run.status === "COMPLETED")
  }, [run?.status, onComplete])

  return null
}

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const self = useSelf()
  const room = useRoom()
  const { workspaceProject } = useWorkspace()
  const rawMessages = useStorage((root) => root.aiChat)
  // Canvas nodes/edges are stored by @liveblocks/react-flow under the "flow" key
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flowData = useStorage((root) => (root as any).flow as {
    nodes: Record<string, unknown>
    edges: Record<string, unknown>
  } | null)

  const [draft, setDraft] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const roomId = room.id
  const projectId = workspaceProject?.id ?? ""
  const isRunActive = runId !== null

  // Specs state
  const [specs, setSpecs] = useState<SpecItem[]>([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [specsError, setSpecsError] = useState<string | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<SpecItem | null>(null)
  const [specRunId, setSpecRunId] = useState<string | null>(null)
  const [specPublicToken, setSpecPublicToken] = useState<string | null>(null)
  const [isGeneratingSpec, setIsGeneratingSpec] = useState(false)
  const [specGenError, setSpecGenError] = useState<string | null>(null)

  const fetchSpecs = useCallback(() => {
    if (!projectId) return
    setSpecsLoading(true)
    setSpecsError(null)
    fetch(`/api/projects/${projectId}/specs`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load specs")
        return res.json() as Promise<{ specs: SpecItem[] }>
      })
      .then(({ specs: data }) => setSpecs(data))
      .catch((err: unknown) => setSpecsError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setSpecsLoading(false))
  }, [projectId])

  useEffect(() => {
    fetchSpecs()
  }, [fetchSpecs])

  const downloadSpec = useCallback((specId: string, filename: string) => {
    const a = document.createElement("a")
    a.href = `/api/projects/${projectId}/specs/${specId}/download`
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [projectId])

  const handleGenerateSpec = useCallback(async () => {
    if (!projectId || !roomId || isGeneratingSpec) return
    setIsGeneratingSpec(true)
    setSpecGenError(null)
    try {
      const currentNodes = Object.values(flowData?.nodes ?? {})
      const currentEdges = Object.values(flowData?.edges ?? {})
      const validatedMessages: ChatMessage[] = (rawMessages ?? []).flatMap((msg) => {
        const parsed = ChatMessageSchema.safeParse(msg)
        return parsed.success ? [parsed.data] : []
      })
      const chatHistory = validatedMessages.map((m) => ({ role: m.role, content: m.content }))

      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, chatHistory, nodes: currentNodes, edges: currentEdges }),
      })
      if (!res.ok) throw new Error("Failed to start spec generation")
      const { runId: newRunId } = await res.json() as { runId: string }

      const tokenRes = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      })
      if (!tokenRes.ok) throw new Error("Failed to get spec run token")
      const { token } = await tokenRes.json() as { token: string }

      setSpecRunId(newRunId)
      setSpecPublicToken(token)
    } catch (err) {
      setSpecGenError(err instanceof Error ? err.message : "Failed to generate spec")
      setIsGeneratingSpec(false)
    }
  }, [projectId, roomId, isGeneratingSpec, flowData, rawMessages])

  const handleSpecRunComplete = useCallback((success: boolean) => {
    setSpecRunId(null)
    setSpecPublicToken(null)
    setIsGeneratingSpec(false)
    if (!success) {
      setSpecGenError("Spec generation failed. Please try again.")
      return
    }
    fetchSpecs()
  }, [fetchSpecs])

  // Validate messages from storage before rendering
  const messages: ChatMessage[] = (rawMessages ?? []).flatMap((msg) => {
    const parsed = ChatMessageSchema.safeParse(msg)
    return parsed.success ? [parsed.data] : []
  })

  useEventListener(({ event }) => {
    if (event.type === "AI_PRESENCE") {
      setIsGenerating(event.thinking)
    }
    if (event.type === "AI_STATUS") {
      const parsed = AiStatusPayloadSchema.safeParse({ text: event.message })
      if (parsed.success) {
        setStatusText(parsed.data.text ?? null)
      }
      if (event.state === "complete" || event.state === "error") {
        setIsGenerating(false)
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
        statusTimerRef.current = setTimeout(() => setStatusText(null), 3000)
      }
    }
  })

  const addMessage = useMutation(({ storage }, message: ChatMessage) => {
    storage.get("aiChat").push(new LiveObject(message))
  }, [])

  const handleRunComplete = useCallback((success: boolean) => {
    const aiMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: "Ghost AI",
      role: "assistant",
      content: success
        ? "Design complete! The canvas has been updated."
        : "Something went wrong. Please try again.",
      timestamp: new Date().toISOString(),
    }
    addMessage(aiMessage)
    setRunId(null)
    setPublicToken(null)
    setIsGenerating(false)
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current)
    setStatusText(null)
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }, [addMessage])

  const handleSend = useCallback(async () => {
    const text = draft.trim()
    if (!text || isRunActive || isGenerating) return

    const userMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: self?.info.name ?? "You",
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    }

    try {
      addMessage(userMessage)
      setDraft("")
      setSendError(null)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    } catch {
      setSendError("Failed to send. Please try again.")
      return
    }

    try {
      const designRes = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, roomId, projectId }),
      })
      if (!designRes.ok) throw new Error("Failed to start AI run.")
      const { runId: newRunId } = await designRes.json() as { runId: string }

      const tokenRes = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      })
      if (!tokenRes.ok) throw new Error("Failed to get run token.")
      const { token } = await tokenRes.json() as { token: string }

      setRunId(newRunId)
      setPublicToken(token)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to start AI run."
      const errorMessage: ChatMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: "Ghost AI",
        role: "assistant",
        content: errMsg,
        timestamp: new Date().toISOString(),
      }
      addMessage(errorMessage)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    }
  }, [draft, isRunActive, isGenerating, self, addMessage, roomId, projectId])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const isLoading = isRunActive || isGenerating

  return (
    <aside
      className={[
        "absolute top-0 right-0 bottom-0 z-40 w-80",
        "pt-2 pr-2 pb-2",
        "transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      ].join(" ")}
    >
      <div className="flex flex-col h-full rounded-xl overflow-hidden border border-border-default bg-elevated shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-default shrink-0">
          <Bot className="h-5 w-5 text-ai-text shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-copy-primary leading-tight">AI Workspace</p>
            <p className="text-xs text-copy-muted leading-tight">Collaborate with Ghost AI</p>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-copy-muted hover:text-copy-primary hover:bg-subtle transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="architect" className="flex-1 min-h-0 gap-0">
          <div className="px-3 pt-2 shrink-0">
            <TabsList className="w-full bg-subtle h-8 p-0.5">
              <TabsTrigger
                value="architect"
                className="flex-1 text-xs text-copy-muted data-active:bg-ai data-active:text-white"
              >
                AI Architect
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className="flex-1 text-xs text-copy-muted data-active:bg-ai data-active:text-white"
              >
                Specs
              </TabsTrigger>
            </TabsList>
          </div>

          {/* AI Architect tab — ai-chat feed */}
          <TabsContent value="architect" className="min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto p-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-subtle">
                    <Bot className="h-6 w-6 text-ai-text" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-copy-primary">Start a conversation</p>
                    <p className="text-xs text-copy-muted mt-1">
                      Describe your architecture and Ghost AI will help you design it.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    {STARTER_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => {
                          setDraft(chip)
                          textareaRef.current?.focus()
                        }}
                        className="rounded-full bg-subtle text-ai-text text-xs px-3 py-1.5 text-left hover:bg-border-default transition-colors"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {messages.map((msg) =>
                    msg.role === "user" ? (
                      <div key={msg.id} className="flex flex-col items-end gap-0.5">
                        <span className="text-[10px] text-copy-faint px-1">{msg.sender}</span>
                        <div className="max-w-[85%] rounded-xl bg-[#62C073] px-3 py-2 text-sm text-[#0f2e18] font-medium">
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-copy-faint px-1">{formatTime(msg.timestamp)}</span>
                      </div>
                    ) : (
                      <div key={msg.id} className="flex flex-col items-start gap-0.5">
                        <span className="text-[10px] text-copy-faint px-1">{msg.sender}</span>
                        <div className="max-w-[85%] rounded-xl bg-subtle border border-border-default px-3 py-2 text-sm text-copy-primary">
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-copy-faint px-1">{formatTime(msg.timestamp)}</span>
                      </div>
                    )
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Status strip — shown only when a run is active */}
            {(isRunActive || statusText) && (
              <div className="flex items-center gap-2 px-4 py-2 bg-subtle border-t border-border-default shrink-0">
                <Loader2 className="h-3.5 w-3.5 text-ai-text animate-spin shrink-0" />
                <span className="text-xs text-copy-secondary truncate">
                  {statusText ?? "Ghost AI is working…"}
                </span>
              </div>
            )}

            <div className="shrink-0 px-3 pb-3 pt-2 border-t border-border-default">
              {sendError && (
                <div className="flex items-center gap-1.5 mb-2 text-xs text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{sendError}</span>
                </div>
              )}
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  placeholder={isLoading ? "AI is working…" : "Describe your architecture..."}
                  className="flex-1 resize-none min-h-18 max-h-40 bg-subtle border-border-default text-copy-primary placeholder:text-copy-faint text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  onClick={handleSend}
                  disabled={!draft.trim() || isLoading}
                  size="icon"
                  className="bg-[#62C073] text-[#0f2e18] hover:bg-[#62C073]/90 shrink-0 self-end"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Specs tab */}
          <TabsContent value="specs" className="min-h-0 flex flex-col flex-1">
            {/* Generate button — always visible at top */}
            <div className="px-3 pt-3 pb-2 shrink-0">
              <Button
                onClick={handleGenerateSpec}
                disabled={isGeneratingSpec || !projectId}
                className="w-full bg-ai text-white hover:bg-ai/90 disabled:opacity-60"
              >
                {isGeneratingSpec ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating…
                  </>
                ) : (
                  "Generate Spec"
                )}
              </Button>
              {specGenError && (
                <p className="text-xs text-red-400 mt-2 text-center">{specGenError}</p>
              )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
              {specsLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-4 w-4 animate-spin text-copy-muted" />
                </div>
              ) : specsError ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <p className="text-xs text-red-400">{specsError}</p>
                  <button
                    onClick={fetchSpecs}
                    className="flex items-center gap-1 text-xs text-copy-muted hover:text-copy-primary transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                </div>
              ) : specs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <FileText className="h-8 w-8 text-copy-faint" />
                  <div>
                    <p className="text-sm font-medium text-copy-primary">No specs yet</p>
                    <p className="text-xs text-copy-muted mt-1">Generate one above.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {specs.map((spec) => (
                    <div
                      key={spec.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedSpec(spec)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedSpec(spec) }}
                      className="group rounded-xl bg-elevated border border-border-default p-3 cursor-pointer hover:border-border-subtle transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-ai-text shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-copy-primary truncate">{spec.filename}</p>
                          <p className="text-[10px] text-copy-muted mt-0.5">
                            {new Date(spec.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            downloadSpec(spec.id, spec.filename)
                          }}
                          className="h-7 w-7 flex items-center justify-center rounded-lg text-copy-faint opacity-0 group-hover:opacity-100 hover:text-copy-primary hover:bg-subtle transition-all shrink-0"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {runId && publicToken && (
        <RunTracker runId={runId} publicToken={publicToken} onComplete={handleRunComplete} />
      )}

      {specRunId && specPublicToken && (
        <SpecRunTracker runId={specRunId} publicToken={specPublicToken} onComplete={handleSpecRunComplete} />
      )}

      <SpecPreviewModal
        projectId={projectId}
        specId={selectedSpec?.id ?? null}
        filename={selectedSpec?.filename ?? ""}
        onClose={() => setSelectedSpec(null)}
      />
    </aside>
  )
}
