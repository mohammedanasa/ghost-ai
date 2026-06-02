import type { CanvasNode, CanvasEdge, NodeShape } from '@/types/canvas'
import { NODE_COLORS } from '@/types/canvas'

export interface CanvasTemplate {
  id: string
  name: string
  description: string
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

const C = {
  neutral: NODE_COLORS[0].fill,
  blue:    NODE_COLORS[1].fill,
  purple:  NODE_COLORS[2].fill,
  orange:  NODE_COLORS[3].fill,
  red:     NODE_COLORS[4].fill,
  green:   NODE_COLORS[6].fill,
  teal:    NODE_COLORS[7].fill,
}

function n(
  id: string,
  label: string,
  x: number,
  y: number,
  color: string,
  shape: NodeShape,
  width: number,
  height: number,
): CanvasNode {
  return {
    id,
    type: 'canvasNode',
    position: { x, y },
    data: { label, color, shape },
    width,
    height,
  }
}

function e(id: string, source: string, target: string): CanvasEdge {
  return { id, type: 'canvasEdge', source, target }
}

const microservices: CanvasTemplate = {
  id: 'microservices',
  name: 'Microservices',
  description: 'API Gateway routes traffic to isolated services, each backed by a dedicated database and connected via a shared message bus.',
  nodes: [
    n('api',      'API Gateway',      240, 0,   C.blue,   'pill',      160, 50),
    n('auth',     'Auth Service',     0,   160, C.purple, 'rectangle', 140, 60),
    n('users',    'User Service',     190, 160, C.blue,   'rectangle', 140, 60),
    n('orders',   'Order Service',    380, 160, C.teal,   'rectangle', 140, 60),
    n('products', 'Product Service',  570, 160, C.green,  'rectangle', 140, 60),
    n('db',       'Database',         0,   340, C.neutral,'cylinder',  120, 70),
    n('bus',      'Message Bus',      380, 340, C.orange, 'cylinder',  120, 70),
  ],
  edges: [
    e('e1', 'api',      'auth'),
    e('e2', 'api',      'users'),
    e('e3', 'api',      'orders'),
    e('e4', 'api',      'products'),
    e('e5', 'auth',     'db'),
    e('e6', 'users',    'db'),
    e('e7', 'orders',   'bus'),
    e('e8', 'products', 'bus'),
  ],
}

// Two-row layout: Row 1 feeds into Security Scan, Row 2 continues deployment.
// This keeps the diagram compact and legible in the preview.
const cicd: CanvasTemplate = {
  id: 'cicd-pipeline',
  name: 'CI/CD Pipeline',
  description: 'End-to-end delivery from source commit through build, test, containerisation, and staged deployment to production.',
  nodes: [
    n('source',  'Source Code',    0,    65,  C.green,  'rectangle', 125, 50),
    n('build',   'Build',          180,  65,  C.blue,   'pill',      105, 50),
    n('test',    'Test',           345,  65,  C.orange, 'pill',      105, 50),
    n('scan',    'Security Scan',  490,  5,   C.red,    'diamond',   105, 105),
    n('staging', 'Deploy Staging', 490,  195, C.teal,   'rectangle', 140, 55),
    n('smoke',   'Smoke Tests',    690,  205, C.purple, 'pill',      115, 45),
    n('prod',    'Deploy Prod',    860,  195, C.green,  'rectangle', 125, 55),
  ],
  edges: [
    e('e1', 'source',  'build'),
    e('e2', 'build',   'test'),
    e('e3', 'test',    'scan'),
    e('e4', 'scan',    'staging'),
    e('e5', 'staging', 'smoke'),
    e('e6', 'smoke',   'prod'),
  ],
}

const eventDriven: CanvasTemplate = {
  id: 'event-driven',
  name: 'Event-Driven System',
  description: 'Producers publish events to a central bus. Independent consumers handle emails, push notifications, analytics, and error queues.',
  nodes: [
    n('prod-a',  'Producer A',     0,    0,   C.blue,   'pill',      130, 50),
    n('prod-b',  'Producer B',     0,    155, C.orange, 'pill',      130, 50),
    n('bus',     'Event Bus',      230,  75,  C.teal,   'hexagon',   120, 120),
    n('cons-a',  'Consumer A',     470,  0,   C.green,  'rectangle', 130, 55),
    n('cons-b',  'Consumer B',     470,  110, C.purple, 'rectangle', 130, 55),
    n('cons-c',  'Analytics',      470,  220, C.blue,   'rectangle', 130, 55),
    n('dlq',     'Dead Letter Q',  470,  330, C.red,    'cylinder',  130, 55),
    n('storage', 'Storage',        710,  110, C.neutral,'cylinder',  110, 70),
  ],
  edges: [
    e('e1', 'prod-a', 'bus'),
    e('e2', 'prod-b', 'bus'),
    e('e3', 'bus',    'cons-a'),
    e('e4', 'bus',    'cons-b'),
    e('e5', 'bus',    'cons-c'),
    e('e6', 'bus',    'dlq'),
    e('e7', 'cons-a', 'storage'),
    e('e8', 'cons-b', 'storage'),
  ],
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [microservices, cicd, eventDriven]
