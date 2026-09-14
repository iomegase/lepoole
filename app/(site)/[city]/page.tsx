import type { Metadata } from 'next'
import Link from 'next/link'
import { cache } from 'react'
import { notFound } from 'next/navigation'

import { prisma } from '@/lib/prisma'
import { ServiceGrid } from '@/components/service-grid'

type PageProps = {
  params: Promise<{
    city: string
  }>
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

const getCity = cache(async (slug: string) => {
  return prisma.city.findUnique({
    where: { slug },
  })
})

function getCityName(slug: string) {
  return slug
    .replace(/^electricien-/, '')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getMetaDescription(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()

  return clean.length > 155
    ? `${clean.slice(0, 152).trim()}...`
    : clean
}

function jsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/* -------------------------------------------------------------------------- */
/*                                   SEO                                      */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { city: slug } = await params
  const city = await getCity(slug)

  if (!city || !city.published) {
    return {}
  }

  const cityName = getCityName(slug)
  const description = getMetaDescription(city.intro)

  return {
    title: city.title,

    description,

    alternates: {
      canonical: `/${slug}`,
    },

    openGraph: {
      title: city.title,
      description,
      type: 'website',
      url: `/${slug}`,
      siteName: 'Le Poole Electric',
      locale: 'fr_FR',
    },

    twitter: {
      card: 'summary_large_image',
      title: city.title,
      description,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    keywords: [
      `électricien ${cityName}`,
      `électricien à ${cityName}`,
      `dépannage électrique ${cityName}`,
      `rénovation électrique ${cityName}`,
      `installation électrique ${cityName}`,
      `tableau électrique ${cityName}`,
    ],
  }
}

/* -------------------------------------------------------------------------- */
/*                            Static generation                               */
/* -------------------------------------------------------------------------- */

export async function generateStaticParams() {
  const cities = await prisma.city.findMany({
    where: {
      published: true,
      isPrimary: false,
    },
    select: {
      slug: true,
    },
  })

  return cities.map((city) => ({
    city: city.slug,
  }))
}

/* -------------------------------------------------------------------------- */
/*                                  Page                                      */
/* -------------------------------------------------------------------------- */

export default async function CityPage({ params }: PageProps) {
  const { city: slug } = await params

  const city = await getCity(slug)

  if (!city || city.isPrimary || !city.published) {
    notFound()
  }

  const cityName = getCityName(slug)

  const nearbyCities = await prisma.city.findMany({
    where: {
      published: true,
      isPrimary: false,
      slug: {
        not: slug,
      },
    },
    select: {
      slug: true,
      title: true,
    },
    orderBy: {
      slug: 'asc',
    },
    take: 6,
  })

  const phone = process.env.NEXT_PUBLIC_PHONE?.trim()
  const phoneHref = phone
    ? `tel:${phone.replace(/[^\d+]/g, '')}`
    : null

  const faq = [
    {
      question: `Quels travaux électriques réalisez-vous à ${cityName} ?`,
      answer: `Le Poole Electric intervient à ${cityName} pour les travaux d’électricité courants : rénovation électrique, mise en sécurité, tableaux électriques, prises, éclairage, dépannage et installation électrique.`,
    },
    {
      question: `Intervenez-vous pour une rénovation électrique à ${cityName} ?`,
      answer: `Oui. Nous pouvons intervenir lors d’une rénovation partielle ou complète afin d’adapter l’installation électrique au logement et au projet.`,
    },
    {
      question: `Comment demander un devis d’électricité à ${cityName} ?`,
      answer: `Vous pouvez envoyer votre demande en précisant le type de logement, les travaux envisagés et, si possible, joindre des photos. Cela permet de préparer plus précisément l’intervention et le devis.`,
    },
    {
      question: `Quel est le délai d’intervention à ${cityName} ?`,
      answer: `Le délai dépend de la nature des travaux et du planning. Pour un dépannage ou un chantier avec une contrainte particulière, précisez-le directement dans votre demande.`,
    },
  ]

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || undefined

  const pageUrl = baseUrl
    ? `${baseUrl}/${slug}`
    : undefined

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: `Électricien à ${cityName}`,
        description: city.intro,
        url: pageUrl,
        provider: {
          '@type': 'Electrician',
          name: 'Le Poole Electric',
          url: baseUrl,
          telephone: phone || undefined,
        },
        areaServed: {
          '@type': 'City',
          name: cityName,
        },
        serviceType: [
          'Installation électrique',
          'Rénovation électrique',
          'Dépannage électrique',
          'Mise en sécurité électrique',
        ],
      },

      {
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(structuredData),
        }}
      />

      <main>
        {/* HERO */}
        <section className="border-b border-black/10 bg-[#f6f3ec]">
          <div className="container py-16 md:py-24 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_.8fr]">
              <div className="max-w-4xl">
                <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-black/50">
                  Électricien · {cityName}
                </p>

                <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:text-5xl md:text-6xl lg:text-7xl">
                  {city.title}
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-8 text-black/65 md:text-xl">
                  {city.intro}
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/devis"
                    className="inline-flex min-h-14 items-center justify-center rounded-full bg-black px-7 text-sm font-bold text-white transition hover:bg-black/80"
                  >
                    Demander un devis
                  </Link>

                  {phoneHref && (
                    <a
                      href={phoneHref}
                      className="inline-flex min-h-14 items-center justify-center rounded-full border border-black/15 bg-white/50 px-7 text-sm font-bold transition hover:bg-white"
                    >
                      Appeler {phone}
                    </a>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-black/55">
                  <span>Installation</span>
                  <span>Rénovation</span>
                  <span>Dépannage</span>
                  <span>Mise en sécurité</span>
                </div>
              </div>

              {/* CTA CARD */}
              <aside className="rounded-[2rem] bg-black p-7 text-white md:p-9">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/45">
                  Votre projet
                </p>

                <h2 className="mt-4 text-2xl font-black tracking-tight md:text-3xl">
                  Besoin d’un électricien à {cityName} ?
                </h2>

                <p className="mt-4 leading-7 text-white/65">
                  Décrivez votre installation, votre problème ou votre chantier.
                  Vous pouvez également joindre des photos à votre demande de
                  devis.
                </p>

                <Link
                  href="/devis"
                  className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-sm font-bold text-black transition hover:bg-white/85"
                >
                  Décrire mon projet
                </Link>

                <p className="mt-5 text-xs leading-5 text-white/40">
                  Maison · Appartement · Rénovation · Construction
                </p>
              </aside>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section
          id="services"
          className="border-b border-black/10 py-20 md:py-28"
        >
          <div className="container">
            <div className="mb-12 max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-black/45">
                Nos prestations
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] md:text-5xl">
                Travaux électriques à {cityName}
              </h2>

              <p className="mt-5 text-lg leading-8 text-black/60">
                Des interventions adaptées aussi bien aux logements existants
                qu’aux projets de rénovation ou de construction.
              </p>
            </div>

            <ServiceGrid />
          </div>
        </section>

        {/* LOCAL CONTENT */}
        <section className="bg-[#f6f3ec] py-20 md:py-28">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-black/45">
                  Intervention locale
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] md:text-4xl">
                  Votre électricien à {cityName}
                </h2>

                <p className="mt-5 leading-7 text-black/55">
                  Le Poole Electric intervient dans le secteur pour les projets
                  électriques des particuliers et professionnels.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-7 shadow-sm md:p-10">
                <div className="whitespace-pre-line text-[17px] leading-8 text-black/70">
                  {city.content}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REASSURANCE */}
        <section className="border-y border-black/10 py-20 md:py-24">
          <div className="container">
            <div className="grid gap-10 md:grid-cols-3">
              <div>
                <p className="text-5xl font-black tracking-[-0.06em]">
                  01
                </p>

                <h3 className="mt-5 text-xl font-black">
                  Une demande précise
                </h3>

                <p className="mt-3 leading-7 text-black/55">
                  Décrivez votre chantier et transmettez des photos pour
                  faciliter la préparation du devis.
                </p>
              </div>

              <div>
                <p className="text-5xl font-black tracking-[-0.06em]">
                  02
                </p>

                <h3 className="mt-5 text-xl font-black">
                  Une intervention locale
                </h3>

                <p className="mt-3 leading-7 text-black/55">
                  Intervention à {cityName} et dans les communes du secteur.
                </p>
              </div>

              <div>
                <p className="text-5xl font-black tracking-[-0.06em]">
                  03
                </p>

                <h3 className="mt-5 text-xl font-black">
                  Un devis adapté
                </h3>

                <p className="mt-3 leading-7 text-black/55">
                  Les prestations, quantités, fournitures et règles de TVA sont
                  déterminées selon la nature réelle du chantier.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-black/45">
                  Questions fréquentes
                </p>

                <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] md:text-4xl">
                  Électricien à {cityName}
                </h2>
              </div>

              <div className="divide-y divide-black/10 border-y border-black/10">
                {faq.map((item) => (
                  <details
                    key={item.question}
                    className="group py-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-bold">
                      {item.question}

                      <span className="text-2xl font-light transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>

                    <p className="max-w-2xl pt-4 leading-7 text-black/60">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* INTERNAL LINKING */}
        {nearbyCities.length > 0 && (
          <section className="border-t border-black/10 bg-[#f6f3ec] py-16 md:py-20">
            <div className="container">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-black/45">
                Secteur d’intervention
              </p>

              <h2 className="mt-4 text-2xl font-black tracking-tight md:text-3xl">
                Électricien dans les communes voisines
              </h2>

              <div className="mt-8 flex flex-wrap gap-3">
                {nearbyCities.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}`}
                    className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-bold transition hover:border-black hover:bg-black hover:text-white"
                  >
                    {getCityName(item.slug)}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FINAL CTA */}
        <section className="bg-black py-20 text-white md:py-28">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/40">
                Le Poole Electric
              </p>

              <h2 className="mt-5 text-4xl font-black tracking-[-0.045em] md:text-6xl">
                Un projet électrique à {cityName} ?
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
                Décrivez votre besoin et transmettez les informations utiles
                pour préparer votre demande.
              </p>

              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/devis"
                  className="inline-flex min-h-14 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-black"
                >
                  Demander un devis
                </Link>

                {phoneHref && (
                  <a
                    href={phoneHref}
                    className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 px-8 text-sm font-bold"
                  >
                    {phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}