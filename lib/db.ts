/**
 * Singleton Prisma Client for Next.js
 *
 * In development, Next.js hot reload creates new module instances on every
 * file change. Without this singleton pattern, each reload would open a new
 * database connection, quickly exhausting the connection pool.
 *
 * In production, a new PrismaClient is created once per serverless function
 * invocation — this is the expected behaviour.
 *
 * This file is server-only. Never import it in client components.
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
