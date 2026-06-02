import { Liveblocks } from '@liveblocks/node'

const CURSOR_COLORS = [
  '#FF5733',
  '#33C3FF',
  '#A833FF',
  '#33FF57',
  '#FF33A8',
  '#FFB833',
  '#33FFF5',
  '#FF3333',
  '#5733FF',
  '#33FF99',
]

export function getCursorColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
  }
  return CURSOR_COLORS[hash % CURSOR_COLORS.length]
}

declare global {
  // eslint-disable-next-line no-var
  var __liveblocks: Liveblocks | undefined
}

export function getLiveblocks(): Liveblocks {
  if (globalThis.__liveblocks) return globalThis.__liveblocks
  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret) throw new Error('LIVEBLOCKS_SECRET_KEY is required for Liveblocks client')
  const client = new Liveblocks({ secret })
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__liveblocks = client
  }
  return client
}
