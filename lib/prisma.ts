import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { withAccelerate } from '@prisma/extension-accelerate'

type PrismaClientInstance = ReturnType<typeof createClient>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientInstance | undefined
}

function createClient() {
  const url = process.env.DATABASE_URL ?? ''
  if (url.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: url }).$extends(withAccelerate())
  }
  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClientInstance =
  globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
