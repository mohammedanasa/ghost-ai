"use client"

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { RectangleHorizontal, Diamond, Circle, Pill, Cylinder, Hexagon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NodeShape, ShapeDragPayload } from '@/types/canvas'
import { NODE_SHAPES, DEFAULT_NODE_COLOR } from '@/types/canvas'

const SHAPE_ICONS: Record<NodeShape, LucideIcon> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
}

interface DragState {
  shape: NodeShape
  width: number
  height: number
  x: number
  y: number
}

function DragPreview({ state }: { state: DragState }) {
  const { shape, width, height, x, y } = state
  const fill = DEFAULT_NODE_COLOR.fill
  const border = 'var(--border-subtle)'

  const left = x - width / 2
  const top = y - height / 2

  function renderShape() {
    if (shape === 'rectangle') {
      return (
        <div
          className="w-full h-full rounded-xl border"
          style={{ background: fill, borderColor: border }}
        />
      )
    }
    if (shape === 'pill') {
      return (
        <div
          className="w-full h-full rounded-full border"
          style={{ background: fill, borderColor: border }}
        />
      )
    }
    if (shape === 'circle') {
      return (
        <div
          className="w-full h-full rounded-full border"
          style={{ background: fill, borderColor: border }}
        />
      )
    }

    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {shape === 'diamond' && (
          <polygon
            points="50,2 98,50 50,98 2,50"
            fill={fill}
            stroke={border}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {shape === 'hexagon' && (
          <polygon
            points="50,2 92,26 92,74 50,98 8,74 8,26"
            fill={fill}
            stroke={border}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {shape === 'cylinder' && (
          <>
            <rect x="5" y="18" width="90" height="70" fill={fill} stroke="none" />
            <ellipse cx="50" cy="18" rx="45" ry="10" fill={fill} stroke={border} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <line x1="5" y1="18" x2="5" y2="88" stroke={border} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <line x1="95" y1="18" x2="95" y2="88" stroke={border} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d="M5,88 A45,10 0 0 1 95,88" fill="none" stroke={border} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
    )
  }

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left,
        top,
        width,
        height,
        pointerEvents: 'none',
        opacity: 0.75,
        zIndex: 9999,
      }}
    >
      {renderShape()}
    </div>,
    document.body
  )
}

export function ShapePanel() {
  const [dragState, setDragState] = useState<DragState | null>(null)

  function handleDragStart(e: React.DragEvent<HTMLButtonElement>, payload: ShapeDragPayload) {
    e.dataTransfer.setData('application/canvas-shape', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'copy'
    // Suppress default browser drag ghost
    const blank = new Image()
    e.dataTransfer.setDragImage(blank, 0, 0)
    setDragState({ ...payload, x: e.clientX, y: e.clientY })
  }

  function handleDrag(e: React.DragEvent<HTMLButtonElement>) {
    if (e.clientX === 0 && e.clientY === 0) return
    setDragState(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null)
  }

  function handleDragEnd() {
    setDragState(null)
  }

  return (
    <>
      <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-elevated border border-border-default shadow-lg">
        {NODE_SHAPES.map(({ shape, width, height }) => {
          const Icon = SHAPE_ICONS[shape]
          return (
            <button
              key={shape}
              type="button"
              draggable
              onDragStart={(e) => handleDragStart(e, { shape, width, height })}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              className="flex items-center justify-center h-8 w-8 rounded-xl text-copy-secondary hover:text-copy-primary hover:bg-subtle transition-colors cursor-grab active:cursor-grabbing"
              title={shape}
            >
              <Icon className="h-4 w-4" />
            </button>
          )
        })}
      </div>
      {dragState && <DragPreview state={dragState} />}
    </>
  )
}
