"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { CanvasTemplate } from './starter-templates'
import { CANVAS_TEMPLATES } from './starter-templates'
import type { CanvasNode, CanvasEdge, NodeShape } from '@/types/canvas'

// ---------------------------------------------------------------------------
// Lightweight SVG preview — no React Flow instance needed.
// Uses the template's own coordinate space as the viewBox so SVG handles
// all scaling. The outer div controls aspect ratio; SVG fills it at 100%.
// ---------------------------------------------------------------------------

const PREVIEW_PAD = 36

function nodeCenterX(node: CanvasNode) {
  return node.position.x + (node.width ?? 120) / 2
}
function nodeCenterY(node: CanvasNode) {
  return node.position.y + (node.height ?? 60) / 2
}

function PreviewShape({
  shape, x, y, w, h, fill,
}: {
  shape: NodeShape; x: number; y: number; w: number; h: number; fill: string
}) {
  switch (shape) {
    case 'circle':
      return <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill={fill} />
    case 'pill':
      return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />
    case 'diamond': {
      const cx = x + w / 2, cy = y + h / 2
      return <polygon points={`${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`} fill={fill} />
    }
    case 'hexagon': {
      const cx = x + w / 2, cy = y + h / 2
      const pts = [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return `${cx + (w / 2) * Math.cos(rad)},${cy + (h / 2) * Math.sin(rad)}`
      })
      return <polygon points={pts.join(' ')} fill={fill} />
    }
    case 'cylinder':
      return (
        <g>
          <rect x={x} y={y + h * 0.18} width={w} height={h * 0.82} rx={2} fill={fill} />
          <ellipse cx={x + w / 2} cy={y + h * 0.18} rx={w / 2} ry={h * 0.18} fill={fill} />
          <ellipse cx={x + w / 2} cy={y + h} rx={w / 2} ry={h * 0.18} fill={fill} fillOpacity={0.55} />
        </g>
      )
    default:
      return <rect x={x} y={y} width={w} height={h} rx={6} fill={fill} />
  }
}

function TemplatePreview({ nodes, edges }: { nodes: CanvasNode[]; edges: CanvasEdge[] }) {
  if (nodes.length === 0) return null

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const node of nodes) {
    const w = node.width ?? 120, h = node.height ?? 60
    if (node.position.x < minX) minX = node.position.x
    if (node.position.y < minY) minY = node.position.y
    if (node.position.x + w > maxX) maxX = node.position.x + w
    if (node.position.y + h > maxY) maxY = node.position.y + h
  }

  const vx = minX - PREVIEW_PAD
  const vy = minY - PREVIEW_PAD
  const vw = (maxX - minX) + PREVIEW_PAD * 2
  const vh = (maxY - minY) + PREVIEW_PAD * 2

  const nodeById = new Map(nodes.map((node) => [node.id, node]))

  return (
    <div
      className="w-full aspect-16/10 rounded-t-2xl overflow-hidden"
      style={{ background: 'var(--bg-base)' }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {edges.map((edge) => {
          const src = nodeById.get(edge.source)
          const tgt = nodeById.get(edge.target)
          if (!src || !tgt) return null
          return (
            <line
              key={edge.id}
              x1={nodeCenterX(src)}
              y1={nodeCenterY(src)}
              x2={nodeCenterX(tgt)}
              y2={nodeCenterY(tgt)}
              stroke="#4a4a55"
              strokeWidth={4}
            />
          )
        })}
        {nodes.map((node) => (
          <PreviewShape
            key={node.id}
            shape={node.data.shape}
            x={node.position.x}
            y={node.position.y}
            w={node.width ?? 120}
            h={node.height ?? 60}
            fill={node.data.color}
          />
        ))}
      </svg>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

interface StarterTemplatesModalProps {
  open: boolean
  onClose: () => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({ open, onClose, onImport }: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-4xl sm:max-w-4xl w-full rounded-3xl bg-elevated border-border-default p-6">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-copy-primary text-lg font-semibold">
            Import Template
          </DialogTitle>
          <p className="text-sm text-copy-muted mt-0.5">
            Choose a starter template to pre-populate your canvas. Any existing nodes will be replaced.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col rounded-2xl border border-border-default bg-surface overflow-hidden hover:border-border-subtle transition-colors"
            >
              <TemplatePreview nodes={template.nodes} edges={template.edges} />
              <div className="flex flex-col flex-1 gap-3 p-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-copy-primary leading-tight">
                    {template.name}
                  </p>
                  <p className="text-xs text-copy-muted mt-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-2 mt-auto"
                  onClick={() => handleImport(template)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Import
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
