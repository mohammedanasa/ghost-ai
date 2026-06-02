"use client"

import { memo, useState, useRef, useEffect } from 'react'
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'
import type { CanvasNode, CanvasEdge } from '@/types/canvas'

function EdgeLabelInput({
  value,
  onCommit,
}: {
  value: string
  onCommit: (v: string) => void
}) {
  const [text, setText] = useState(value)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    e.stopPropagation()
    if (e.key === 'Enter') onCommit(text)
    if (e.key === 'Escape') onCommit(value)
  }

  return (
    <input
      ref={ref}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onCommit(text)}
      onKeyDown={handleKeyDown}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        width: `${Math.max(48, text.length * 8 + 20)}px`,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
        borderRadius: '9999px',
        padding: '2px 10px',
        fontSize: 11,
        outline: 'none',
        textAlign: 'center',
        display: 'block',
      }}
    />
  )
}

function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps<CanvasEdge>) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>()

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const active = hovered || selected
  const strokeOpacity = active ? 1 : 0.45

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    setEditing(true)
  }

  function handleCommit(label: string) {
    setEditing(false)
    updateEdgeData(id, { label })
  }

  const savedLabel = data?.label?.trim()

  return (
    <>
      <g
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Wide invisible hit area for easier hover/click */}
        <path
          d={edgePath}
          fill="none"
          strokeWidth={20}
          stroke="transparent"
          strokeLinecap="round"
          onDoubleClick={handleDoubleClick}
        />
        {/* Visible edge line */}
        <path
          d={edgePath}
          fill="none"
          strokeWidth={1.5}
          stroke="#f8fafc"
          strokeOpacity={strokeOpacity}
          strokeLinecap="round"
          markerEnd={markerEnd}
          style={{ transition: 'stroke-opacity 0.15s ease', pointerEvents: 'none' }}
        />
      </g>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {editing ? (
            <EdgeLabelInput value={data?.label ?? ''} onCommit={handleCommit} />
          ) : (
            <div onDoubleClick={handleDoubleClick}>
              {savedLabel ? (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: 11,
                    fontWeight: 500,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                    userSelect: 'none',
                    cursor: 'default',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {savedLabel}
                </span>
              ) : active ? (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: 11,
                    color: 'var(--text-faint)',
                    userSelect: 'none',
                    cursor: 'text',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add label…
                </span>
              ) : null}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export const canvasEdgeTypes = {
  canvasEdge: memo(CanvasEdgeComponent),
}
