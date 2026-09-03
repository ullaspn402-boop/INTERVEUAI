const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

async function main() {
  console.log('Testing connection...')
  await db.$connect()
  console.log('CONNECTED TO NEON POSTGRESQL SUCCESS!')
  const count = await db.user.count()
  console.log(`Current user count: ${count}`)
}

main()
  .catch((e) => {
    console.error('Connection failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
