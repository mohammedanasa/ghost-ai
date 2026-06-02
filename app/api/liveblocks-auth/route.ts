import { getLiveblocks, getCursorColor } from '@/lib/liveblocks'
import { getCurrentIdentityWithUser, getAccessibleProject } from '@/lib/project-access'

export async function POST(request: Request) {
  const identityWithUser = await getCurrentIdentityWithUser()
  if (!identityWithUser) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { room } = await request.json()
  if (typeof room !== 'string' || !room) {
    return new Response('Bad Request', { status: 400 })
  }

  const { userId, email, user } = identityWithUser

  const project = await getAccessibleProject(room, userId, email)
  if (!project) {
    return new Response('Forbidden', { status: 403 })
  }

  const name =
    user?.fullName ??
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress ??
    'Anonymous'
  const avatar = user?.imageUrl ?? ''
  const color = getCursorColor(userId)

  const liveblocks = getLiveblocks()

  try {
    await liveblocks.getOrCreateRoom(room, { defaultAccesses: [] })

    await liveblocks.updateRoom(room, {
      usersAccesses: { [userId]: ['room:write'] },
    })

    const { status, body } = await liveblocks.identifyUser(
      userId,
      { userInfo: { name, avatar, color } },
    )

    return new Response(body, { status })
  } catch (err) {
    console.error('[liveblocks-auth]', err)
    return new Response('Internal Server Error', { status: 500 })
  }
}
