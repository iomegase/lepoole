'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { destroyAdminSession, isAdmin } from '@/lib/auth'

async function guard() {
  if (!(await isAdmin())) redirect('/admin/login')
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function optional(formData: FormData, key: string) {
  const value = text(formData, key)
  return value || null
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function refreshPublic() {
  revalidatePath('/', 'layout')
  revalidatePath('/sitemap.xml')
}

export async function logoutAction() {
  await destroyAdminSession()
  redirect('/admin/login')
}

export async function updateSettingsAction(formData: FormData) {
  await guard()
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {
      companyName: text(formData, 'companyName'),
      founderName: text(formData, 'founderName'),
      foundedYear: Number(formData.get('foundedYear') ?? 2002),
      phone: optional(formData, 'phone'),
      email: optional(formData, 'email'),
      address: optional(formData, 'address'),
      heroTitle: text(formData, 'heroTitle'),
      heroSubtitle: text(formData, 'heroSubtitle'),
      googleReviewUrl: optional(formData, 'googleReviewUrl'),
      googleRating: optional(formData, 'googleRating') ? Number(formData.get('googleRating')) : null,
      googleReviewCount: Number(formData.get('googleReviewCount') ?? 0),
    },
    create: { id: 1 },
  })
  refreshPublic()
  redirect('/admin?saved=settings')
}

export async function updateCityAction(formData: FormData) {
  await guard()
  const id = Number(formData.get('id'))
  await prisma.city.update({
    where: { id },
    data: {
      title: text(formData, 'title'),
      intro: text(formData, 'intro'),
      content: text(formData, 'content'),
      published: formData.get('published') === 'on',
    },
  })
  refreshPublic()
  redirect('/admin?saved=city')
}

export async function updateServiceAction(formData: FormData) {
  await guard()
  const id = Number(formData.get('id'))
  await prisma.service.update({
    where: { id },
    data: {
      title: text(formData, 'title'),
      excerpt: text(formData, 'excerpt'),
      content: text(formData, 'content'),
      published: formData.get('published') === 'on',
    },
  })
  refreshPublic()
  redirect('/admin?saved=service')
}

export async function createProjectAction(formData: FormData) {
  await guard()
  const title = text(formData, 'title')
  const requestedSlug = text(formData, 'slug')
  await prisma.project.create({
    data: {
      title,
      slug: slugify(requestedSlug || title),
      cityId: Number(formData.get('cityId')),
      serviceId: formData.get('serviceId') ? Number(formData.get('serviceId')) : null,
      problem: text(formData, 'problem'),
      workDone: text(formData, 'workDone'),
      result: text(formData, 'result'),
      beforeImage: optional(formData, 'beforeImage'),
      afterImage: optional(formData, 'afterImage'),
      completedAt: formData.get('completedAt') ? new Date(String(formData.get('completedAt'))) : null,
      published: true,
    },
  })
  refreshPublic()
  redirect('/admin?saved=project')
}

export async function updateProjectAction(formData: FormData) {
  await guard()
  const id = Number(formData.get('id'))
  const title = text(formData, 'title')
  await prisma.project.update({
    where: { id },
    data: {
      title,
      slug: slugify(text(formData, 'slug') || title),
      cityId: Number(formData.get('cityId')),
      serviceId: formData.get('serviceId') ? Number(formData.get('serviceId')) : null,
      problem: text(formData, 'problem'),
      workDone: text(formData, 'workDone'),
      result: text(formData, 'result'),
      beforeImage: optional(formData, 'beforeImage'),
      afterImage: optional(formData, 'afterImage'),
      completedAt: formData.get('completedAt') ? new Date(String(formData.get('completedAt'))) : null,
      published: formData.get('published') === 'on',
    },
  })
  refreshPublic()
  redirect('/admin?saved=project-update')
}

export async function toggleProjectAction(formData: FormData) {
  await guard()
  const id = Number(formData.get('id'))
  const project = await prisma.project.findUniqueOrThrow({ where: { id } })
  await prisma.project.update({ where: { id }, data: { published: !project.published } })
  refreshPublic()
  redirect('/admin')
}

export async function deleteProjectAction(formData: FormData) {
  await guard()
  await prisma.project.delete({ where: { id: Number(formData.get('id')) } })
  refreshPublic()
  redirect('/admin?saved=project-delete')
}
