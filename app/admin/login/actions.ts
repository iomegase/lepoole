'use server'

import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { createAdminSession } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const expectedEmail = (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase()
  const hash = process.env.ADMIN_PASSWORD_HASH ?? ''

  if (!expectedEmail || !hash || email !== expectedEmail) redirect('/admin/login?error=1')
  const ok = await bcrypt.compare(password, hash)
  if (!ok) redirect('/admin/login?error=1')

  await createAdminSession(email)
  redirect('/admin')
}
