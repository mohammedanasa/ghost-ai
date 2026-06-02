"use client"

import { useState, useRef, useCallback, type KeyboardEvent } from "react"
import { Bot, X, Send, FileText, Download, Loader2, AlertCircle } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useEventListener, useStorage, useMutation, useSelf } from "@liveblocks/react"
import { LiveObject } from "@liveblocks/client"
import { AiStatusPayloadSchema, ChatMessageSchema, type ChatMessage } from "@/types/tasks"

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

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const self = useSelf()
  const rawMessages = useStorage((root) => root.aiChat)
  const [draft, setDraft] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusText, setStatusText] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const handleSend = useCallback(() => {
    const text = draft.trim()
    if (!text || isGenerating) return

    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: self?.info.name ?? "You",
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    }

    try {
      addMessage(message)
      setDraft("")
      setSendError(null)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    } catch {
      setSendError("Failed to send. Please try again.")
    }
  }, [draft, isGenerating, self, addMessage])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

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

        {/* AI status strip — ai-status-feed subscription */}
        {(isGenerating || statusText) && (
          <div className="flex items-center gap-2 px-4 py-2 bg-subtle border-b border-border-default shrink-0">
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 text-ai-text animate-spin shrink-0" />
            ) : (
              <Bot className="h-3.5 w-3.5 text-ai-text shrink-0" />
            )}
            <span className="text-xs text-copy-secondary truncate">
              {statusText ?? "Ghost AI is working…"}
            </span>
          </div>
        )}

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
                        <div className="max-w-[85%] rounded-xl bg-brand-dim border-2 border-brand/50 px-3 py-2 text-sm text-copy-primary">
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-copy-faint px-1">{formatTime(msg.timestamp)}</span>
                      </div>
                    ) : (
                      <div key={msg.id} className="flex flex-col items-start gap-0.5">
                        <span className="text-[10px] text-copy-faint px-1">{msg.sender}</span>
                        <div className="max-w-[85%] rounded-xl bg-elevated border border-border-default px-3 py-2 text-sm text-ai-text">
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
                  disabled={isGenerating}
                  placeholder={isGenerating ? "AI is working…" : "Describe your architecture..."}
                  className="flex-1 resize-none min-h-18 max-h-40 bg-subtle border-border-default text-copy-primary placeholder:text-copy-faint text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  onClick={handleSend}
                  disabled={!draft.trim() || isGenerating}
                  size="icon"
                  className="bg-ai text-white hover:bg-ai/90 shrink-0 self-end"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Specs tab */}
          <TabsContent value="specs" className="min-h-0 flex flex-col">
            <div className="flex flex-col gap-3 p-3">
              <Button className="w-full bg-ai text-white hover:bg-ai/90">
                Generate Spec
              </Button>

              <div className="rounded-xl bg-elevated border border-border-default p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle">
                    <FileText className="h-4 w-4 text-ai-text" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-copy-primary leading-tight">
                      Microservices Architecture
                    </p>
                    <p className="text-xs text-copy-muted mt-1 line-clamp-2">
                      A scalable microservices system with API gateway, auth service, and message queue for async communication.
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    disabled
                    className="flex items-center gap-1.5 text-xs text-copy-faint opacity-50 cursor-not-allowed"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  )
}
