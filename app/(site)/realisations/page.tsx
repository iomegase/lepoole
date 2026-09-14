import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Toutes nos réalisations | Le Poole Electric',
  description:
    'Découvrez les réalisations de Le Poole Electric à Triel-sur-Seine et dans les environs : rénovation électrique, tableaux électriques, dépannage et installations.',
}

export default async function RealisationsPage() {
  const projects = await prisma.project.findMany({
    where: {
      published: true,
    },
    include: {
      city: true,
      service: true,
    },
    orderBy: [
      {
        completedAt: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],
  })

  return (
    <main className="bg-[#171714] text-white">
      {/* HERO */}
      <section className="">
        <div className="container pb-12 pt-16 md:pb-16 md:pt-24 lg:pb-20 lg:pt-28">
          <div className="max-w-5xl">
            <div className="eyebrow !text-white/40">
              Portfolio local
            </div>

            <h1
              className="
                mt-6
                max-w-5xl
                text-[clamp(3.5rem,9vw,8rem)]
                font-black
                uppercase
                leading-[0.85]
                tracking-[-0.07em]
              "
            >
              Nos
              <br />
              réalisations
              <span className="text-[#f26422]">.</span>
            </h1>

            <div
              className="
                mt-8
                grid
                max-w-4xl
                gap-8
                md:grid-cols-[1fr_auto]
                md:items-end
              "
            >
              <p className="max-w-2xl text-base leading-7 text-white/55 md:text-lg md:leading-8">
                Une sélection de chantiers réalisés à Triel-sur-Seine et
                dans les communes voisines : rénovation, remplacement de
                tableaux électriques, installations et dépannage.
              </p>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tracking-[-0.06em] text-[#f26422]">
                  {projects.length}
                </span>

                <span className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
                  {projects.length > 1 ? 'réalisations' : 'réalisation'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LISTE */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          {projects.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-x-4
                gap-y-10
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              {projects.map((project) => {
                const image =
                  project.afterImage || project.beforeImage

                return (
                  <Link
                    key={project.id}
                    href={`/realisations/${project.slug}`}
                    className="group block"
                  >
                    {/* IMAGE */}
                    <div
                      className="
                        relative
                        aspect-[4/3]
                        overflow-hidden
                        rounded-[20px]
                        border
                        border-white/10
                        bg-[#24241f]
                      "
                    >
                      {image ? (
                        <div
                          className="
                            absolute
                            inset-0
                            bg-cover
                            bg-center
                            transition-transform
                            duration-700
                            ease-out
                            group-hover:scale-[1.04]
                          "
                          style={{
                            backgroundImage: `url(${image})`,
                          }}
                        />
                      ) : (
                        <div className="tech-grid absolute inset-0" />
                      )}

                      {/* OVERLAY */}
                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-t
                          from-black/80
                          via-black/10
                          to-transparent
                        "
                      />

                      {/* SERVICE */}
                      {project.service && (
                        <div
                          className="
                            absolute
                            left-4
                            top-4
                            rounded-[8px]
                            bg-[#f26422]
                            px-3
                            py-2
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.12em]
                            text-white
                          "
                        >
                          {project.service.name}
                        </div>
                      )}

                      {/* FLÈCHE */}
                      {/* <div
                        className="
                          absolute
                          right-4
                          top-4
                          flex
                          size-11
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-lg
                          font-black
                          text-[#171714]
                          transition-all
                          duration-300
                          group-hover:rotate-45
                          group-hover:bg-[#f26422]
                          group-hover:text-white
                        "
                      >
                        ↗
                      </div> */}

                      {/* VILLE */}
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div
                          className="
                            text-[10px]
                            font-black
                            uppercase
                            tracking-[0.15em]
                            text-[#f26422]
                          "
                        >
                          {project.city.name}
                        </div>
                      </div>
                    </div>

                    {/* TEXTE */}
                    <div className="pt-5">
                      <h2
                        className="
                          text-[1.45rem]
                          font-black
                          uppercase
                          leading-[1]
                          tracking-[-0.045em]
                          text-white
                          transition-colors
                          duration-300
                          group-hover:text-[#f26422]
                          md:text-[1.7rem]
                        "
                      >
                        {project.title}
                      </h2>

                      <p
                        className="
                          mt-3
                          line-clamp-2
                          max-w-md
                          text-sm
                          leading-6
                          text-white/45
                        "
                      >
                        {project.problem}
                      </p>

                      <div
                        className="
                          mt-5
                          border-t
                          border-white/10
                          pt-4
                          text-[11px]
                          font-black
                          uppercase
                          tracking-[0.12em]
                          text-white/35
                          transition-colors
                          group-hover:text-white
                        "
                      >
                        Voir la réalisation
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div
              className="
                tech-grid
                rounded-[24px]
                border
                border-white/10
                px-6
                py-24
                text-center
              "
            >
              <p className="text-2xl font-black uppercase tracking-[-0.04em]">
                Aucune réalisation publiée pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA BAS */}
<section className="bg-white py-20 md:py-28">
  <div className="container">
    <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
      <div>
        <div className="eyebrow text-black/30">
          Votre projet
        </div>

        <h2 className="mt-5 max-w-6xl text-[clamp(3rem,7vw,7rem)] font-black uppercase leading-[.88] tracking-[-0.065em] text-[#171714]">
          Parlons de votre
          <br />
          prochain chantier
          <span className="text-[#f26422]">.</span>
        </h2>
      </div>

      <div className="flex items-center justify-center">
        <Link
          href="/devis"
          className="
            btn-primary
            inline-flex
            items-center
            justify-center
            gap-8
            rounded-[18px]
            px-8
            py-5
            font-black
            transition-transform
            duration-300
            hover:-translate-y-1
          "
        >
          <span>Demander un devis</span>
       
        </Link>
      </div>
    </div>
  </div>
</section>
    </main>
  )
}