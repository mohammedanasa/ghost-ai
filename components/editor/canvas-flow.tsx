"use client"

import { useRef, useEffect, useState } from 'react'
import { ReactFlow, Background, BackgroundVariant, ConnectionMode, Panel, MarkerType, useNodes, useEdges } from '@xyflow/react'
import type { ReactFlowInstance } from '@xyflow/react'
import { useLiveblocksFlow, Cursors, type CursorsCursorProps } from '@liveblocks/react-flow'
import { useUndo, useRedo, useCanUndo, useCanRedo, useOthers, useOther, useEventListener } from '@liveblocks/react'
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2, Bot, Loader2 } from 'lucide-react'
import { useUser, UserButton } from '@clerk/nextjs'
import type { CanvasNode, CanvasEdge, ShapeDragPayload, NodeShape } from '@/types/canvas'
import { DEFAULT_NODE_COLOR } from '@/types/canvas'
import { canvasNodeTypes } from './canvas-node'
import { canvasEdgeTypes } from './canvas-edge'
import { ShapePanel } from './shape-panel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useCanvasAutosave } from '@/hooks/use-canvas-autosave'
import { useWorkspace } from './workspace-context'
import '@xyflow/react/dist/style.css'
import '@liveblocks/react-ui/styles.css'
import '@liveblocks/react-flow/styles.css'

interface ControlBarProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
}

function ControlBar({ onZoomIn, onZoomOut, onFitView, onUndo, onRedo, canUndo, canRedo }: ControlBarProps) {
  const btnBase = 'flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/10 active:bg-white/20'
  const disabledCls = 'opacity-30 cursor-not-allowed pointer-events-none'

  return (
    <div className="flex items-center gap-0.5 rounded-full bg-surface border border-border-subtle px-2 py-1.5 shadow-lg">
      <button onClick={onZoomOut} className={btnBase} title="Zoom out">
        <ZoomOut className="w-4 h-4 text-copy-secondary" />
      </button>
      <button onClick={onFitView} className={btnBase} title="Fit view">
        <Maximize2 className="w-4 h-4 text-copy-secondary" />
      </button>
      <button onClick={onZoomIn} className={btnBase} title="Zoom in">
        <ZoomIn className="w-4 h-4 text-copy-secondary" />
      </button>

      <div className="w-px h-5 bg-border-subtle mx-1" />

      <button onClick={onUndo} disabled={!canUndo} className={`${btnBase} ${!canUndo ? disabledCls : ''}`} title="Undo">
        <Undo2 className="w-4 h-4 text-copy-secondary" />
      </button>
      <button onClick={onRedo} disabled={!canRedo} className={`${btnBase} ${!canRedo ? disabledCls : ''}`} title="Redo">
        <Redo2 className="w-4 h-4 text-copy-secondary" />
      </button>
    </div>
  )
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return (parts[0]?.[0] ?? '?').toUpperCase()
}

function CustomCursor({ connectionId }: CursorsCursorProps) {
  const info = useOther(connectionId, (other) => other.info)
  const thinking = useOther(connectionId, (other) => other.presence.thinking ?? false)
  if (!info) return null

  return (
    <div className="pointer-events-none select-none flex flex-col items-start gap-1">
      <svg width="14" height="18" viewBox="0 0 10 16" fill={info.color}>
        <path
          d="M0,0 L0,13 L3,10 L5,15.5 L6.5,14.5 L4.5,9 L8,9 Z"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="rounded-full px-2 py-0.5 text-xs font-medium text-white whitespace-nowrap shadow-sm flex items-center gap-1"
        style={{ backgroundColor: info.color }}
      >
        {thinking && <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
        {info.name}
      </div>
    </div>
  )
}

function PresenceAvatars() {
  const { user } = useUser()
  const others = useOthers()
  const collaborators = others.filter((other) => other.id !== user?.id)
  const visible = collaborators.slice(0, 5)
  const overflowCount = Math.max(0, collaborators.length - 5)

  return (
    <div className="flex items-center gap-2 rounded-full bg-surface/90 backdrop-blur border border-border-subtle px-2 py-1 shadow-lg">
      {visible.length > 0 && (
        <>
          <div className="flex items-center">
            {visible.map((other, index) => (
              <div
                key={other.connectionId}
                title={other.info?.name}
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-semibold text-white shrink-0"
                style={{
                  marginLeft: index > 0 ? '-8px' : '0',
                  zIndex: visible.length - index,
                  position: 'relative',
                  boxShadow: '0 0 0 2px var(--surface)',
                  backgroundColor: other.info?.color ?? '#6b7280',
                }}
              >
                {other.info?.avatar ? (
                  <img
                    src={other.info.avatar}
                    alt={other.info?.name ?? ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(other.info?.name ?? '')
                )}
              </div>
            ))}
            {overflowCount > 0 && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-copy-secondary shrink-0"
                style={{
                  marginLeft: '-8px',
                  zIndex: 0,
                  position: 'relative',
                  boxShadow: '0 0 0 2px var(--surface)',
                  backgroundColor: 'var(--elevated)',
                }}
              >
                +{overflowCount}
              </div>
            )}
          </div>
          <div className="w-px h-5 bg-border-subtle" />
        </>
      )}
      <UserButton />
    </div>
  )
}

function DeleteKeyHandler({
  onDelete,
}: {
  onDelete: (params: { nodes: CanvasNode[]; edges: CanvasEdge[] }) => void
}) {
  const nodes = useNodes<CanvasNode>()
  const edges = useEdges<CanvasEdge>()
  const latestNodes = useRef(nodes)
  const latestEdges = useRef(edges)
  latestNodes.current = nodes
  latestEdges.current = edges

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) return

      const selectedNodes = latestNodes.current.filter(n => n.selected)
      const selectedEdges = latestEdges.current.filter(ed => ed.selected)

      if (selectedNodes.length === 0 && selectedEdges.length === 0) return
      onDelete({ nodes: selectedNodes, edges: selectedEdges })
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDelete])

  return null
}

interface AiStatus {
  message: string
  state: 'start' | 'processing' | 'complete' | 'error'
}

function AiActivityPanel({ thinking, status }: { thinking: boolean; status: AiStatus | null }) {
  if (!thinking && !status) return null
  return (
    <div className="flex items-center gap-2 rounded-full bg-elevated/90 backdrop-blur border border-border-subtle px-3 py-1.5 shadow-lg max-w-65">
      {thinking ? (
        <Loader2 className="w-4 h-4 text-ai-text animate-spin shrink-0" />
      ) : (
        <Bot className="w-4 h-4 text-ai-text shrink-0" />
      )}
      <span className="text-xs text-copy-secondary truncate">
        {status?.message ?? 'Ghost AI is working…'}
      </span>
    </div>
  )
}

let nodeCounter = 0

export function CanvasFlow() {
  const rfInstanceRef = useRef<ReactFlowInstance<CanvasNode, CanvasEdge> | null>(null)

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  const { pendingTemplateImport, setPendingTemplateImport, workspaceProject, setSaveStatus, setTriggerSave } = useWorkspace()
  const projectId = workspaceProject?.id

  const [aiThinking, setAiThinking] = useState(false)
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null)
  const aiStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  const edgesRef = useRef(edges)
  edgesRef.current = edges

  useEventListener(({ event }) => {
    switch (event.type) {
      case 'AI_STATUS': {
        setAiStatus({ message: event.message, state: event.state })
        if (event.state === 'complete' || event.state === 'error') {
          if (aiStatusTimerRef.current) clearTimeout(aiStatusTimerRef.current)
          aiStatusTimerRef.current = setTimeout(() => setAiStatus(null), 3000)
          if (event.state === 'complete') {
            setTimeout(() => rfInstanceRef.current?.fitView({ duration: 400, padding: 0.15 }), 100)
          }
        }
        break
      }
      case 'AI_PRESENCE':
        setAiThinking(event.thinking)
        break
      case 'AI_ADD_NODE':
        onNodesChange([{
          type: 'add',
          item: {
            id: event.id,
            type: 'canvasNode',
            position: { x: event.x, y: event.y },
            data: { label: event.label, color: event.color, shape: event.shape as NodeShape },
            width: event.width,
            height: event.height,
          } as CanvasNode,
        }])
        break
      case 'AI_MOVE_NODE':
        onNodesChange([{ type: 'position', id: event.id, position: { x: event.x, y: event.y } }])
        break
      case 'AI_RESIZE_NODE':
        onNodesChange([{
          type: 'dimensions',
          id: event.id,
          dimensions: { width: event.width, height: event.height },
          setAttributes: true,
        }])
        break
      case 'AI_UPDATE_NODE_DATA': {
        const node = nodesRef.current.find((n) => n.id === event.id)
        if (node) {
          onNodesChange([{
            type: 'replace',
            id: event.id,
            item: {
              ...node,
              data: {
                ...node.data,
                ...(event.label !== undefined && { label: event.label }),
                ...(event.color !== undefined && { color: event.color }),
                ...(event.shape !== undefined && { shape: event.shape as NodeShape }),
              },
            },
          }])
        }
        break
      }
      case 'AI_DELETE_NODE': {
        const node = nodesRef.current.find((n) => n.id === event.id)
        if (node) onDelete({ nodes: [node], edges: [] })
        break
      }
      case 'AI_ADD_EDGE':
        onEdgesChange([{
          type: 'add',
          item: {
            id: event.id,
            source: event.source,
            target: event.target,
            type: 'canvasEdge',
            data: { label: event.label },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#f8fafc', width: 14, height: 14 },
          } as CanvasEdge,
        }])
        break
      case 'AI_DELETE_EDGE': {
        const edge = edgesRef.current.find((e) => e.id === event.id)
        if (edge) onDelete({ nodes: [], edges: [edge] })
        break
      }
    }
  })

  // Load saved canvas from blob when room is empty on mount
  useEffect(() => {
    if (!projectId) return
    if (nodes.length > 0 || edges.length > 0) return
    fetch(`/api/projects/${projectId}/canvas`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { nodes: CanvasNode[]; edges: CanvasEdge[] } | null) => {
        if (!data?.nodes?.length && !data?.edges?.length) return
        onNodesChange(data.nodes.map((n) => ({ type: 'add' as const, item: n })))
        onEdgesChange(data.edges.map((e) => ({ type: 'add' as const, item: e })))
        setTimeout(() => rfInstanceRef.current?.fitView({ duration: 300 }), 50)
      })
      .catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { status: saveStatus, save } = useCanvasAutosave(nodes, edges, projectId)
  useEffect(() => { setSaveStatus(saveStatus) }, [saveStatus, setSaveStatus])
  useEffect(() => {
    setTriggerSave(save)
    return () => setTriggerSave(null)
  }, [save, setTriggerSave])

  useEffect(() => {
    if (!pendingTemplateImport) return
    onNodesChange([
      ...nodes.map((node) => ({ type: 'remove' as const, id: node.id })),
      ...pendingTemplateImport.nodes.map((node) => ({ type: 'add' as const, item: node })),
    ])
    onEdgesChange([
      ...edges.map((edge) => ({ type: 'remove' as const, id: edge.id })),
      ...pendingTemplateImport.edges.map((edge) => ({ type: 'add' as const, item: edge })),
    ])
    setPendingTemplateImport(null)
    setTimeout(() => rfInstanceRef.current?.fitView({ duration: 300 }), 50)
  }, [pendingTemplateImport]) // eslint-disable-line react-hooks/exhaustive-deps

  useKeyboardShortcuts({ rfRef: rfInstanceRef, undo, redo })

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/canvas-shape')
    if (!raw || !rfInstanceRef.current) return
    let payload: ShapeDragPayload
    try {
      payload = JSON.parse(raw) as ShapeDragPayload
    } catch (err) {
      console.error('[canvas-flow] invalid drop payload, JSON parse failed', err, raw)
      return
    }

    if (!payload || typeof payload.shape !== 'string' || typeof payload.width !== 'number' || typeof payload.height !== 'number') {
      console.error('[canvas-flow] invalid drop payload, missing required fields', payload)
      return
    }

    const flowCursorPos = rfInstanceRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const position = {
      x: flowCursorPos.x - payload.width / 2,
      y: flowCursorPos.y - payload.height / 2,
    }

    nodeCounter++
    const id = `${payload.shape}-${Date.now()}-${nodeCounter}`

    rfInstanceRef.current.addNodes({
      id,
      type: 'canvasNode',
      position,
      data: { label: '', color: DEFAULT_NODE_COLOR.fill, shape: payload.shape },
      width: payload.width,
      height: payload.height,
    })
  }

  return (
    <div className="h-full w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDelete={onDelete}
        nodeTypes={canvasNodeTypes}
        edgeTypes={canvasEdgeTypes}
        defaultEdgeOptions={{
          type: 'canvasEdge',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#f8fafc', width: 14, height: 14 },
        }}
        onInit={(instance) => { rfInstanceRef.current = instance }}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={null}
      >
        <DeleteKeyHandler onDelete={onDelete} />
        <Background variant={BackgroundVariant.Dots} />
        <Cursors components={{ Cursor: CustomCursor }} />
        <Panel position="top-left" className="mt-2 ml-2">
          <AiActivityPanel thinking={aiThinking} status={aiStatus} />
        </Panel>
        <Panel position="top-right" className="mt-2 mr-2">
          <PresenceAvatars />
        </Panel>
        <Panel position="bottom-left" className="mb-4 ml-4">
          <ControlBar
            onZoomIn={() => rfInstanceRef.current?.zoomIn({ duration: 200 })}
            onZoomOut={() => rfInstanceRef.current?.zoomOut({ duration: 200 })}
            onFitView={() => rfInstanceRef.current?.fitView({ duration: 200 })}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </Panel>
        <Panel position="bottom-center" className="mb-4">
          <ShapePanel />
        </Panel>
      </ReactFlow>
    </div>
  )
}
