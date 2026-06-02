"use client"

import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from '@liveblocks/react'
import { ErrorBoundary } from 'react-error-boundary'
import { CanvasFlow } from './canvas-flow'

interface CanvasRoomProps {
  roomId: string
}

export function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
        <ErrorBoundary fallback={<CanvasError />}>
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <CanvasFlow />
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
