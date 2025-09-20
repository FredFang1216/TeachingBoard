import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, name: string, password: string, role: 'TEACHER' | 'ADMIN' = 'TEACHER') {
  const hashedPassword = await hashPassword(password)
  
  return prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
    },
  })
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      groups: {
        include: {
          students: {
            include: {
              scoreRecords: {
                orderBy: { createdAt: 'desc' }
              }
            }
          }
        }
      }
    }
  })
}

export async function authenticateUser(email: string, password: string) {
  const user = await findUserByEmail(email)
  
  if (!user) {
    return null
  }
  
  const isValid = await verifyPassword(password, user.password)
  
  if (!isValid) {
    return null
  }
  
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}
