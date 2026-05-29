"use client"

import { useRef } from 'react'
import { ReactFlow, Background, BackgroundVariant, MiniMap, ConnectionMode, Panel } from '@xyflow/react'
import { useLiveblocksFlow, Cursors } from '@liveblocks/react-flow'
import type { CanvasNode, CanvasEdge, ShapeDragPayload } from '@/types/canvas'
import { DEFAULT_NODE_COLOR } from '@/types/canvas'
import { canvasNodeTypes } from './canvas-node'
import { ShapePanel } from './shape-panel'
import '@xyflow/react/dist/style.css'
import '@liveblocks/react-ui/styles.css'
import '@liveblocks/react-flow/styles.css'

interface FlowInstance {
  addNodes: (nodes: CanvasNode | CanvasNode[]) => void
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number }
}

let nodeCounter = 0

export function CanvasFlow() {
  const rfInstanceRef = useRef<FlowInstance | null>(null)

  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow<CanvasNode, CanvasEdge>({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/canvas-shape')
    if (!raw || !rfInstanceRef.current) return

    const payload = JSON.parse(raw) as ShapeDragPayload
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
        onInit={(instance) => { rfInstanceRef.current = instance as FlowInstance }}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} />
        <Cursors />
        <Panel position="bottom-center" className="mb-4">
          <ShapePanel />
        </Panel>
      </ReactFlow>
    </div>
  )
}
