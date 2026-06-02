"use client"

import { useRef, useEffect } from 'react'
import { ReactFlow, Background, BackgroundVariant, ConnectionMode, Panel, MarkerType } from '@xyflow/react'
import type { ReactFlowInstance } from '@xyflow/react'
import { useLiveblocksFlow, Cursors } from '@liveblocks/react-flow'
import { useUndo, useRedo, useCanUndo, useCanRedo } from '@liveblocks/react'
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from 'lucide-react'
import type { CanvasNode, CanvasEdge, ShapeDragPayload } from '@/types/canvas'
import { DEFAULT_NODE_COLOR } from '@/types/canvas'
import { canvasNodeTypes } from './canvas-node'
import { canvasEdgeTypes } from './canvas-edge'
import { ShapePanel } from './shape-panel'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
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

  const { pendingTemplateImport, setPendingTemplateImport } = useWorkspace()

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

    const position = rfInstanceRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })

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
        fitView
      >
        <Background variant={BackgroundVariant.Dots} />
        <Cursors />
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
