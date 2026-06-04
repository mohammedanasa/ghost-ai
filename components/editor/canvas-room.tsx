"use client"

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from '@liveblocks/react'
import { LiveList } from '@liveblocks/client'
import { ErrorBoundary } from 'react-error-boundary'
import { CanvasFlow } from './canvas-flow'
import { AiSidebar } from './ai-sidebar'
import { useWorkspace } from './workspace-context'

interface CanvasRoomProps {
  roomId: string
}

function CanvasWithSidebar() {
  const { isAISidebarOpen, toggleAISidebar } = useWorkspace()
  return (
    <div className="relative h-full w-full">
      <CanvasFlow />
      <AiSidebar isOpen={isAISidebarOpen} onClose={toggleAISidebar} />
    </div>
  )
}

export function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, thinking: false }} initialStorage={{ aiChat: new LiveList([]) }}>
        <ErrorBoundary fallback={<CanvasError />}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <CanvasWithSidebar />
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function CanvasLoading() {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-sm text-copy-muted">Loading canvas…</p>
    </div>
  )
}

function CanvasError() {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-sm text-copy-muted">Failed to connect to canvas.</p>
    </div>
  )
}
