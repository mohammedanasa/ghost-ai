import type { Node, Edge } from '@xyflow/react'

export type NodeShape = 'rectangle' | 'diamond' | 'circle' | 'pill' | 'cylinder' | 'hexagon'

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  shape: NodeShape
}

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>
export type CanvasEdge = Edge<Record<string, unknown>, 'canvasEdge'>

export interface NodeColor {
  fill: string
  text: string
}

export const NODE_COLORS: NodeColor[] = [
  { fill: '#1F1F1F', text: '#EDEDED' },
  { fill: '#10233D', text: '#52A8FF' },
  { fill: '#2E1938', text: '#BF7AF0' },
  { fill: '#331B00', text: '#FF990A' },
  { fill: '#3C1618', text: '#FF6166' },
  { fill: '#3A1726', text: '#F75F8F' },
  { fill: '#0F2E18', text: '#62C073' },
  { fill: '#062822', text: '#0AC7B4' },
]

export const DEFAULT_NODE_COLOR: NodeColor = NODE_COLORS[0]

export interface ShapeDragPayload {
  shape: NodeShape
  width: number
  height: number
}

export interface ShapeDefaults {
  shape: NodeShape
  width: number
  height: number
}

export const NODE_SHAPES: ShapeDefaults[] = [
  { shape: 'rectangle', width: 160, height: 80 },
  { shape: 'diamond', width: 120, height: 120 },
  { shape: 'circle', width: 80, height: 80 },
  { shape: 'pill', width: 160, height: 60 },
  { shape: 'cylinder', width: 100, height: 80 },
  { shape: 'hexagon', width: 120, height: 120 },
]
