import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const cookieName = 'lepoole_admin'
const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? 'dev-only-secret-change-me')

export async function createAdminSession(email: string) {
  const token = await new SignJWT({ email, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  const store = await cookies()
  store.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function destroyAdminSession() {
  const store = await cookies()
  store.delete(cookieName)
}

export async function isAdmin() {
  const store = await cookies()
  const token = store.get(cookieName)?.value
  if (!token) return false
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}
