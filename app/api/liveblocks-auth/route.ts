import { currentUser } from '@clerk/nextjs/server'
import { getLiveblocks, getCursorColor } from '@/lib/liveblocks'
import { getCurrentIdentity, getAccessibleProject } from '@/lib/project-access'

export async function POST(request: Request) {
  const identity = await getCurrentIdentity()
  if (!identity) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { room } = await request.json()
  if (typeof room !== 'string' || !room) {
    return new Response('Bad Request', { status: 400 })
  }

  const project = await getAccessibleProject(room, identity.userId, identity.email)
  if (!project) {
    return new Response('Forbidden', { status: 403 })
  }

  const user = await currentUser()
  const name =
    user?.fullName ??
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress ??
    'Anonymous'
  const avatar = user?.imageUrl ?? ''
  const color = getCursorColor(identity.userId)

  const liveblocks = getLiveblocks()

  try {
    await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] })

    await liveblocks.updateRoom(room, {
      usersAccesses: { [identity.userId]: ['room:write'] },
    })

    const { status, body } = await liveblocks.identifyUser(
      identity.userId,
      { userInfo: { name, avatar, color } },
    )

    return new Response(body, { status })
  } catch (err) {
    console.error('[liveblocks-auth]', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
