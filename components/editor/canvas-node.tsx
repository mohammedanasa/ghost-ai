"use client"

import { memo, useState, useRef, useEffect, type CSSProperties } from 'react'
import { Handle, Position, NodeResizer, useReactFlow, type NodeProps } from '@xyflow/react'
import type { CanvasNode, NodeColor } from '@/types/canvas'
import { NODE_COLORS, DEFAULT_NODE_COLOR } from '@/types/canvas'

const MIN_WIDTH = 60
const MIN_HEIGHT = 40

function SwatchButton({ pair, active, onSelect }: { pair: NodeColor; active: boolean; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      className="w-4.5 h-4.5 rounded-full border border-white/10 transition-shadow"
      style={{
        background: pair.fill,
        outline: active ? `2px solid ${pair.text}` : '2px solid transparent',
        outlineOffset: '2px',
        boxShadow: hovered ? `0 0 5px 2px ${pair.text}4D` : 'none',
      }}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  )
}

function ColorToolbar({ nodeId, activeFill }: { nodeId: string; activeFill: string }) {
  const { updateNodeData } = useReactFlow<CanvasNode>()
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1.5 rounded-xl border"
      style={{
        bottom: 'calc(100% + 8px)',
        background: 'var(--bg-elevated)',
        borderColor: 'var(--border-default)',
        zIndex: 50,
        whiteSpace: 'nowrap',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {NODE_COLORS.map((pair) => (
        <SwatchButton
          key={pair.fill}
          pair={pair}
          active={pair.fill === activeFill}
          onSelect={() => updateNodeData(nodeId, { color: pair.fill })}
        />
      ))}
    </div>
  )
}

function LabelEditor({
  value,
  color,
  onCommit,
}: {
  value: string
  color: string
  onCommit: (label: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.textContent = value
    el.focus()
    const range = document.createRange()
    range.selectNodeContents(el)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function commit() {
    onCommit(ref.current?.textContent ?? '')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      onCommit(value)
    }
    e.stopPropagation()
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={commit}
        onKeyDown={handleKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full px-2 text-center text-sm font-medium outline-none cursor-text pointer-events-auto"
        style={{ color, caretColor: color }}
      />
    </div>
  )
}

const HANDLE_STYLE_BASE: CSSProperties = {
  width: 8,
  height: 8,
  background: '#ffffff',
  border: '1.5px solid #1a1a1a',
  borderRadius: '50%',
  transition: 'opacity 0.15s ease',
}

function CanvasNodeComponent({ id, data, selected }: NodeProps<CanvasNode>) {
  const { updateNodeData } = useReactFlow<CanvasNode>()
  const [editing, setEditing] = useState(false)
  const [nodeHovered, setNodeHovered] = useState(false)

  const colorPair = NODE_COLORS.find(c => c.fill === data.color) ?? DEFAULT_NODE_COLOR
  const borderColor = selected ? 'var(--accent-primary)' : 'var(--border-subtle)'
  const label = data.label || data.shape

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    setEditing(true)
  }

  function handleCommit(next: string) {
    setEditing(false)
    updateNodeData(id, { label: next })
  }

  const colorToolbar = selected ? (
    <ColorToolbar nodeId={id} activeFill={colorPair.fill} />
  ) : null

  const resizer = (
    <NodeResizer
      isVisible={selected}
      minWidth={MIN_WIDTH}
      minHeight={MIN_HEIGHT}
      handleStyle={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent-primary)', border: '1px solid var(--border-subtle)', opacity: 0.8 }}
      lineStyle={{ borderColor: 'var(--accent-primary)', opacity: 0.4 }}
    />
  )

  const handleStyle = { ...HANDLE_STYLE_BASE, opacity: nodeHovered ? 1 : 0 }
  const handles = (
    <>
      <Handle type="source" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="target" position={Position.Top} id="top-target" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={handleStyle} />
      <Handle type="target" position={Position.Bottom} id="bottom-target" style={handleStyle} />
      <Handle type="source" position={Position.Left} id="left" style={handleStyle} />
      <Handle type="target" position={Position.Left} id="left-target" style={handleStyle} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyle} />
      <Handle type="target" position={Position.Right} id="right-target" style={handleStyle} />
    </>
  )

  if (data.shape === 'rectangle') {
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-xl border text-sm font-medium relative"
        style={{ background: colorPair.fill, color: colorPair.text, borderColor }}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setNodeHovered(true)}
        onMouseLeave={() => setNodeHovered(false)}
      >
        {colorToolbar}
        {resizer}
        {handles}
        {editing ? (
          <LabelEditor value={data.label} color={colorPair.text} onCommit={handleCommit} />
        ) : (
          <span className="px-2 text-center truncate">{label}</span>
        )}
      </div>
    )
  }

  if (data.shape === 'pill') {
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-full border text-sm font-medium relative"
        style={{ background: colorPair.fill, color: colorPair.text, borderColor }}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setNodeHovered(true)}
        onMouseLeave={() => setNodeHovered(false)}
      >
        {colorToolbar}
        {resizer}
        {handles}
        {editing ? (
          <LabelEditor value={data.label} color={colorPair.text} onCommit={handleCommit} />
        ) : (
          <span className="px-2 text-center truncate">{label}</span>
        )}
      </div>
    )
  }

  if (data.shape === 'circle') {
    return (
      <div
        className="w-full h-full flex items-center justify-center rounded-full border text-sm font-medium relative"
        style={{ background: colorPair.fill, color: colorPair.text, borderColor }}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setNodeHovered(true)}
        onMouseLeave={() => setNodeHovered(false)}
      >
        {colorToolbar}
        {resizer}
        {handles}
        {editing ? (
          <LabelEditor value={data.label} color={colorPair.text} onCommit={handleCommit} />
        ) : (
          <span className="px-2 text-center truncate">{label}</span>
        )}
      </div>
    )
  }

  // SVG shapes: diamond, hexagon, cylinder
  return (
    <div
      className="relative w-full h-full flex items-center justify-center text-sm font-medium"
      style={{ color: colorPair.text }}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setNodeHovered(true)}
      onMouseLeave={() => setNodeHovered(false)}
    >
      {colorToolbar}
      {resizer}
      {handles}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {data.shape === 'diamond' && (
          <polygon
            points="50,2 98,50 50,98 2,50"
            fill={colorPair.fill}
            stroke={borderColor}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {data.shape === 'hexagon' && (
          <polygon
            points="50,2 92,26 92,74 50,98 8,74 8,26"
            fill={colorPair.fill}
            stroke={borderColor}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {data.shape === 'cylinder' && (
          <>
            <rect x="5" y="18" width="90" height="70" fill={colorPair.fill} stroke="none" />
            <ellipse
              cx="50" cy="18" rx="45" ry="10"
              fill={colorPair.fill}
              stroke={borderColor}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <line x1="5" y1="18" x2="5" y2="88" stroke={borderColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <line x1="95" y1="18" x2="95" y2="88" stroke={borderColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path d="M5,88 A45,10 0 0 1 95,88" fill="none" stroke={borderColor} strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>
      {editing ? (
        <LabelEditor value={data.label} color={colorPair.text} onCommit={handleCommit} />
      ) : (
        <span className="relative z-10 px-2 text-center truncate">{label}</span>
      )}
    </div>
  )
}

export const canvasNodeTypes = {
  canvasNode: memo(CanvasNodeComponent),
}
