import { spawnSync } from 'node:child_process'

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!databaseUrl) {
  console.error('DATABASE_URL ou DIRECT_URL manquant dans .env')
  process.exit(1)
}

const result = spawnSync('prisma', process.argv.slice(2), {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: databaseUrl },
})

if (result.error) {
  console.error(result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
