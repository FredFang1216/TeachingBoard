const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建管理员用户
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '管理员',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // 创建教师用户
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      name: '张老师',
      password: teacherPassword,
      role: 'TEACHER',
    },
  })

  // 创建示例班级
  const group = await prisma.group.upsert({
    where: { id: 'demo-group-1' },
    update: {},
    create: {
      id: 'demo-group-1',
      name: '三年级一班',
      description: '这是一个示例班级',
      teacherId: teacher.id,
    },
  })

  // 创建示例学生
  const students = [
    {
      name: '小明',
      height: 120,
      weight: 25,
      heartRate: 80,
      totalScore: 150,
    },
    {
      name: '小红',
      height: 118,
      weight: 23,
      heartRate: 85,
      totalScore: 200,
    },
    {
      name: '小刚',
      height: 125,
      weight: 28,
      heartRate: 75,
      totalScore: 120,
    },
    {
      name: '小丽',
      height: 115,
      weight: 22,
      heartRate: 90,
      totalScore: 180,
    },
    {
      name: '小强',
      height: 130,
      weight: 30,
      heartRate: 70,
      totalScore: 95,
    },
  ]

  for (const studentData of students) {
    await prisma.student.upsert({
      where: { 
        name_groupId: {
          name: studentData.name,
          groupId: group.id
        }
      },
      update: {},
      create: {
        ...studentData,
        groupId: group.id,
      },
    })
  }

  console.log('数据库初始化完成！')
  console.log('管理员账户: admin@example.com / admin123')
  console.log('教师账户: teacher@example.com / teacher123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
