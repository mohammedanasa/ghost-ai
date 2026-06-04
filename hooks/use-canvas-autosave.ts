import { useCallback, useEffect, useRef, useState } from 'react'
import type { CanvasNode, CanvasEdge } from '@/types/canvas'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useCanvasAutosave(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  projectId: string | null | undefined,
): { status: SaveStatus; save: () => void } {
  const [status, setStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRenderRef = useRef(true)
  const latestRef = useRef({ nodes, edges, projectId })
  latestRef.current = { nodes, edges, projectId }

  const performSave = useCallback(async () => {
    const { nodes: n, edges: e, projectId: pid } = latestRef.current
    if (!pid) return
    setStatus('saving')
    try {
      const res = await fetch(`/api/projects/${pid}/canvas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: n, edges: e }),
      })
      setStatus(res.ok ? 'saved' : 'error')
    } catch {
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    if (!projectId || (nodes.length === 0 && edges.length === 0)) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(performSave, 2000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [nodes, edges, projectId, performSave])

  const save = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    performSave()
  }, [performSave])

  return { status, save }
}
