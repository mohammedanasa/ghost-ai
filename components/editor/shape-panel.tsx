"use client"

import { RectangleHorizontal, Diamond, Circle, Pill, Cylinder, Hexagon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { NodeShape, ShapeDragPayload } from '@/types/canvas'
import { NODE_SHAPES } from '@/types/canvas'

const SHAPE_ICONS: Record<NodeShape, LucideIcon> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
}

export function ShapePanel() {
  function handleDragStart(e: React.DragEvent<HTMLButtonElement>, payload: ShapeDragPayload) {
    e.dataTransfer.setData('application/canvas-shape', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <div className="flex items-center gap-1 px-3 py-2 rounded-full bg-elevated border border-border-default shadow-lg">
      {NODE_SHAPES.map(({ shape, width, height }) => {
        const Icon = SHAPE_ICONS[shape]
        return (
          <button
            key={shape}
            type="button"
            draggable
            onDragStart={(e) => handleDragStart(e, { shape, width, height })}
            className="flex items-center justify-center h-8 w-8 rounded-xl text-copy-secondary hover:text-copy-primary hover:bg-subtle transition-colors cursor-grab active:cursor-grabbing"
            title={shape}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
