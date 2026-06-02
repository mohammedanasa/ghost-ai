"use client"

import { useEffect, type RefObject } from 'react'

interface ZoomableInstance {
  zoomIn: (opts?: { duration?: number }) => void
  zoomOut: (opts?: { duration?: number }) => void
}

interface UseKeyboardShortcutsOptions {
  rfRef: RefObject<ZoomableInstance | null>
  undo: () => void
  redo: () => void
}

function isEditableTarget(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  )
}

export function useKeyboardShortcuts({ rfRef, undo, redo }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e)) return

      const meta = e.metaKey || e.ctrlKey

      if (!meta && (e.key === '+' || e.key === '=')) {
        e.preventDefault()
        rfRef.current?.zoomIn({ duration: 200 })
        return
      }

      if (!meta && e.key === '-') {
        e.preventDefault()
        rfRef.current?.zoomOut({ duration: 200 })
        return
      }

      const key = e.key.toLowerCase()
      if (meta && !e.shiftKey && key === 'z') {
        e.preventDefault()
        undo()
        return
      }

      if (meta && e.shiftKey && key === 'z') {
        e.preventDefault()
        redo()
        return
      }

      if (meta && key === 'y') {
        e.preventDefault()
        redo()
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [rfRef, undo, redo])
}
