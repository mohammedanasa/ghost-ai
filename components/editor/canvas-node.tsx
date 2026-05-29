"use client"

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { CanvasNode } from '@/types/canvas'
import { NODE_COLORS, DEFAULT_NODE_COLOR } from '@/types/canvas'

function CanvasNodeComponent({ data }: NodeProps<CanvasNode>) {
  const colorPair = NODE_COLORS.find(c => c.fill === data.color) ?? DEFAULT_NODE_COLOR

  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-xl border border-border-subtle text-sm font-medium"
      style={{ background: colorPair.fill, color: colorPair.text }}
    >
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <span className="px-2 text-center truncate">{data.label || data.shape}</span>
    </div>
  )
}

export const canvasNodeTypes = {
  canvasNode: memo(CanvasNodeComponent),
}
