import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

type ProjectPageProps = {
  params: Promise<{ slug: string }>
}

function formatTitle(title: string) {
  if (!title) return title

  return title.charAt(0).toUpperCase() + title.slice(1)
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      city: true,
      service: true,
    },
  })

  if (!project) return {}

  return {
    title: `${formatTitle(project.title)} — ${project.city.name}`,
    description: `${project.problem.slice(
      0,
      140
    )} Intervention Le Poole Electric à ${project.city.name}.`,
  }
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { slug } = await params

  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      city: true,
      service: true,
    },
  })

  if (!project || !project.published) {
    notFound()
  }

  const title = formatTitle(project.title)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    about: project.service?.name,
    contentLocation: {
      '@type': 'Place',
      name: project.city.name,
    },
    datePublished: (
      project.completedAt || project.createdAt
    ).toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Le Poole Electric',
    },
  }

  return (
    <main className="overflow-hidden bg-[#f4f0e7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema),
        }}
      />

      {/* HERO */}
      <section className="relative ">
        <div className="container pb-12 pt-10 md:pb-20 md:pt-16 lg:pt-20">
          <Link
            href="/#realisations"
            className="group inline-flex items-center gap-2 text-sm font-bold text-black/50 transition hover:text-black"
          >
            <span className="transition-transform group-hover:-translate-x-1">
              ←
            </span>
            Retour aux réalisations
          </Link>

          <div className="mt-12 max-w-6xl md:mt-16">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#f26422] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">
                Réalisation
              </span>

              <span className="text-sm font-bold text-black/55">
                {project.city.name}
              </span>

              {project.service && (
                <>
                  <span className="h-1 w-1 rounded-full bg-black/25" />

                  <span className="text-sm font-bold text-black/55">
                    {project.service.name}
                  </span>
                </>
              )}
            </div>

            <h1 className="mt-7 max-w-5xl text-[clamp(3rem,8vw,7.5rem)] font-black leading-[0.88] tracking-[-0.065em] text-[#171714]">
              {title}
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-black/60 md:text-xl">
              Intervention réalisée à{' '}
              <strong className="font-bold text-black">
                {project.city.name}
              </strong>
              {project.service && (
                <>
                  {' '}
                  dans le cadre d&apos;une prestation de{' '}
                  <strong className="font-bold text-black">
                    {project.service.name.toLowerCase()}
                  </strong>
                  .
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* AVANT / APRÈS */}
      {(project.beforeImage || project.afterImage) && (
        <section className="py-10 md:py-16">
          <div className="container">
            <div className="mb-7 flex items-end justify-between gap-6">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-black/40">
                  Le chantier
                </div>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-5xl">
                  Avant / Après
                </h2>
              </div>
            </div>

            <div
              className={`grid gap-4 ${
                project.beforeImage && project.afterImage
                  ? 'lg:grid-cols-2'
                  : 'grid-cols-1'
              }`}
            >
              {project.beforeImage && (
                <figure className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#e7e1d5] md:aspect-[16/11]">
                    <img
                      src={project.beforeImage}
                      alt={`Avant les travaux — ${title}`}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                    />

                    <div className="absolute left-5 top-5 rounded-full bg-[#171714]/90 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur-md">
                      Avant
                    </div>
                  </div>
                </figure>
              )}

              {project.afterImage && (
                <figure className="group">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#e7e1d5] md:aspect-[16/11]">
                    <img
                      src={project.afterImage}
                      alt={`Après les travaux — ${title}`}
                      className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                    />

                    <div className="absolute left-5 top-5 rounded-full bg-[#f26422] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg">
                      Après
                    </div>
                  </div>
                </figure>
              )}
            </div>
          </div>
        </section>
      )}

      {/* CONTENU */}
      <section className="pb-20 pt-10 md:pb-32 md:pt-20">
        <div className="container">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            {/* Colonne gauche */}
            <div>
              <div className="sticky top-32">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-[#f26422]">
                  Intervention
                </div>

                <h2 className="mt-4 max-w-md text-[clamp(2.6rem,5vw,5rem)] font-black leading-[0.93] tracking-[-0.055em]">
                  Un chantier pensé pour durer.
                </h2>

                <p className="mt-7 max-w-md text-base leading-7 text-black/55">
                  Diagnostic, remplacement, raccordement et contrôle :
                  chaque étape est réalisée avec attention pour obtenir une
                  installation propre, lisible et fiable.
                </p>
              </div>
            </div>

            {/* Colonne droite */}
            <div>
              {/* 01 */}
              <article className="py-10 md:py-14">
                <div className="grid gap-5 md:grid-cols-[80px_1fr]">
                  <span className="text-3xl font-black text-[#f26422]/80">
                    01
                  </span>

                  <div>
                    <h3 className="text-xl font-black tracking-[-0.035em]">
                      La problématique
                    </h3>

                    <p className="mt-5 max-w-2xl text-sm md:text-sm leading-8 text-black/60">
                      {project.problem}
                    </p>
                  </div>
                </div>
              </article>

              {/* 02 */}
              <article className=" py-10 md:py-14">
                <div className="grid gap-5 md:grid-cols-[80px_1fr]">
                  <span className="text-2xl font-black text-[#f26422]">
                    02
                  </span>

                  <div>
                   <h3 className="text-xl font-black tracking-[-0.035em]">
                      Les travaux réalisés
                    </h3>

                       <p className="mt-5 max-w-2xl text-sm md:text-sm leading-8 text-black/60">
                      {project.workDone}
                    </p>
                  </div>
                </div>
              </article>

              {/* 03 */}
              <article className=" py-10 md:py-14">
                <div className="grid gap-5 md:grid-cols-[80px_1fr]">
                  <span className="text-3xl font-black text-[#f26422]/80">
                    03
                  </span>

                  <div>
                       <h3 className="text-xl font-black tracking-[-0.035em]">
                      Le résultat
                    </h3>

                       <p className="mt-5 max-w-2xl text-sm md:text-sm leading-8 text-black/60">
                      {project.result}
                    </p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#171714] text-white">
        <div className="container py-16 md:py-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className="max-w-4xl">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-white/40">
                Votre projet
              </div>

              <h2 className="mt-5 text-[clamp(2.8rem,6vw,6rem)] font-black leading-[0.9] tracking-[-0.06em]">
                Un projet électrique à{' '}
                <span className="text-[#f26422]">
                  {project.city.name}
                </span>
                ?
              </h2>
            </div>

            <Link
              href="/demande-de-devis"
              className="inline-flex min-h-14 items-center justify-center rounded-xl bg-[#f26422] px-7 py-4 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-[#ff7a38]"
            >
              Demander un devis
           
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}