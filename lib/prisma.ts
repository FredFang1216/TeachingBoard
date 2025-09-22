import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // 禁用查询缓存，确保获取最新数据
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // 强制每次查询都获取最新数据
  transactionOptions: {
    isolationLevel: 'ReadCommitted'
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
