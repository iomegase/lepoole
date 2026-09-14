import Link from "next/link";
import { siteUrl } from "@/lib/site-url";
import { getCities, getProjects, getSettings } from "@/lib/data";
import { ServiceGrid } from "@/components/service-grid";
import Image from "next/image";

export default async function HomePage() {
  const [settings, cities, projects] = await Promise.all([
    getSettings(),
    getCities(),
    getProjects(6),
  ]);

  const phone = settings.phone || process.env.NEXT_PUBLIC_PHONE || "";
  const years = Math.max(new Date().getFullYear() - settings.foundedYear, 0);
  const heroImage =
    projects.find((project) => project.afterImage)?.afterImage ||
    projects.find((project) => project.beforeImage)?.beforeImage ||
    "";

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Electrician",
    name: settings.companyName,
    founder: settings.founderName,
    foundingDate: String(settings.foundedYear),
    url: siteUrl,
    telephone: settings.phone || undefined,
    email: settings.email || undefined,
    address: settings.address || undefined,
    areaServed: cities.map((city) => city.name),
  };

  return (
    <main className="overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />

      <section className="relative border-b border-black/10 bg-[#f4f0e7]">
  <div className="pointer-events-none absolute -left-32 top-32 size-[420px] rounded-full bg-white/40 blur-3xl" />

  <div
    className="
      container
      relative
      grid
      gap-8
      py-7
      lg:min-h-[690px]
      lg:grid-cols-[1.02fr_.98fr]
      lg:items-stretch
      lg:gap-10
      lg:py-10
    "
  >
    {/* TEXTE */}
    <div className="flex flex-col justify-center py-5 sm:py-8 lg:py-16">
      <div className="eyebrow text-[10px] sm:text-[11px]">
        Électricien · Triel-sur-Seine
      </div>

      <h1
        className="
          mt-5
          max-w-[760px]
          text-[clamp(2.65rem,11vw,4rem)]
          font-black
          uppercase
          leading-[0.88]
          tracking-[-0.065em]
          text-[#171714]
          sm:mt-6
          sm:text-[clamp(3.4rem,9vw,5rem)]
          lg:mt-7
          lg:text-[clamp(4.7rem,6.8vw,6.7rem)]
        "
      >
        {settings.heroTitle}
      </h1>

      <p
        className="
          mt-6
          max-w-xl
          text-[15px]
          leading-6
          text-black/55
          sm:text-[17px]
          sm:leading-7
          lg:mt-7
          lg:text-lg
          lg:leading-8
        "
      >
        {settings.heroSubtitle}
      </p>

      {/* CTA */}
      <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
        {phone && (
          <a
            href={`tel:${phone}`}
            className="
              inline-flex
              min-h-[50px]
              items-center
              justify-center
              rounded-[12px]
              bg-[#f26422]
              px-5
              text-[14px]
              font-black
              !text-white
              shadow-[0_12px_30px_rgba(242,100,34,0.18)]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#ff7432]
              sm:text-[15px]
            "
          >
            Demander une intervention
          </a>
        )}

        <Link
          href="#realisations"
          className="
            inline-flex
            min-h-[50px]
            items-center
            justify-center
            rounded-[12px]
            border
            border-black/10
            bg-white/50
            px-5
            text-[14px]
            font-black
            text-[#171714]
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:bg-white
            sm:text-[15px]
          "
        >
          Voir les chantiers
        </Link>
      </div>

      {/* ARGUMENTS */}
      <div
        className="
          mt-8
          grid
          grid-cols-2
          gap-x-4
          gap-y-3
          border-t
          border-black/10
          pt-5
          sm:flex
          sm:flex-wrap
          sm:gap-x-7
          lg:mt-10
          lg:pt-6
        "
      >
        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-black/45 sm:text-xs">
          Artisan local
        </span>

        <span className="text-[10px] font-black uppercase tracking-[0.1em] text-black/45 sm:text-xs">
          Rénovation & neuf
        </span>

        <span className="col-span-2 text-[10px] font-black uppercase tracking-[0.1em] text-black/45 sm:text-xs">
          Installation connectée
        </span>
      </div>
    </div>

    {/* IMAGE HERO */}
    <div
      className="
        relative
        aspect-[4/5]
        w-full
        overflow-hidden
        rounded-[22px]
        bg-[#171714]
        shadow-[0_24px_65px_rgba(23,23,20,0.18)]
        sm:aspect-[16/10]
        lg:aspect-auto
        lg:min-h-[610px]
      "
    >
      <Image
        src="https://images.unsplash.com/photo-1683295083329-4d4738291f3a?auto=format&fit=crop&w=1600&q=82"
        alt="Électricien professionnel en intervention"
        fill
        priority
        quality={82}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 48vw"
        className="
          object-cover
          object-center
          transition-transform
          duration-700
          lg:hover:scale-[1.025]
        "
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/5" />

      {/* BADGE */}
      <div
        className="
          absolute
          left-4
          top-4
          flex
          items-center
          gap-2
          rounded-[10px]
          bg-white/95
          px-3
          py-2
          text-[9px]
          font-black
          uppercase
          tracking-[0.12em]
          text-[#171714]
          shadow-lg
          sm:left-5
          sm:top-5
          sm:text-[10px]
        "
      >
        <span className="size-2 rounded-full bg-[#f26422]" />
        Depuis {settings.foundedYear}
      </div>

      {/* CONTENU BAS IMAGE */}
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-7">
        <div className="max-w-md">
          <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
            Le Poole Electric
          </div>

          <div
            className="
              mt-2
              max-w-[330px]
              text-xl
              font-black
              uppercase
              leading-[1.05]
              tracking-[-0.04em]
              text-white
              sm:text-2xl
              md:text-3xl
            "
          >
            Une installation propre, fiable et pensée pour durer.
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      <section className="bg-[#fffdf8] py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="eyebrow justify-center">Pourquoi nous choisir</div>

            <h2 className="mt-4 text-[clamp(2.3rem,4.5vw,4.2rem)] font-black uppercase leading-[.95] tracking-[-0.055em]">
              Un engagement constant vers l’excellence.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "+ 24 ans d’expérience",
                "Une entreprise implantée localement et une expérience construite sur le terrain.",
              ],
              [
                "Diagnostic",
                "Une intervention expliquée clairement avant de lancer les travaux.",
              ],
              [
                "Sécurité",
                "Des installations pensées pour être sûres, durables et faciles à maintenir.",
              ],
              [
                "Proximité",
                "Triel-sur-Seine et les communes voisines au cœur de notre secteur.",
              ],
            ].map(([label, text]) => (
              <div
                key={label}
                className="
            flex
            min-h-[260px]
            flex-col
            rounded-[24px]
            border border-black/[0.06]
            bg-white
            p-6
            shadow-[0_16px_40px_rgba(0,0,0,0.05)]
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-[0_22px_50px_rgba(0,0,0,0.08)]
            md:p-7
          "
              >
                <div
                  className="
              text-[15px]
              font-black
              uppercase
              tracking-[0.04em]
              text-[#f26422]
            "
                >
                  {label}
                </div>

                <div className="flex flex-1 items-center">
                  <p
                    className="
                max-w-[260px]
                text-[16px]
                font-black
                leading-[1.3]
                tracking-[-0.03em]
                text-[#171714]
              "
                  >
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="bg-[#f4f0e7] py-20 md:py-28">
        <div className="container">
          <div className="mb-12 grid gap-6 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
            <div>
              <div className="eyebrow">Nos services</div>

              <h2 className="mt-5 max-w-2xl text-[clamp(2.8rem,5.5vw,5.3rem)] font-black uppercase leading-[.92] tracking-[-0.06em]">
                Des solutions électriques fiables.
              </h2>
            </div>

            <p className="max-w-xl text-base leading-7 text-black/55 lg:justify-self-end">
              De la mise en sécurité d’un tableau à la rénovation complète,
              chaque prestation vise le même résultat : une installation claire,
              performante et adaptée à l’usage réel du logement.
            </p>
          </div>
          <ServiceGrid />
        </div>
      </section>

      <section
        id="realisations"
        className="bg-[#171714] py-20 text-white md:py-28"
      >
        <div className="container">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow !text-white/45">Réalisations locales</div>
              <h2 className="mt-5 max-w-3xl text-[clamp(2.7rem,5vw,5rem)] font-black uppercase leading-[.93] tracking-[-0.055em]">
                Le résultat se voit sur le terrain.
              </h2>
            </div>
            <Link
              href="/realisations"
              className="text-sm font-black text-[#f26422] transition hover:text-white"
            >
              Toutes les réalisations{" "}
            </Link>
          </div>

          {projects.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {projects.map((project, index) => {
                const image = project.afterImage || project.beforeImage;
                return (
                  <Link
                    key={project.id}
                    href={`/realisations/${project.slug}`}
                    className={`group relative min-h-[380px] overflow-hidden rounded-[18px] border border-white/10 bg-[#24241f] ${index === 0 ? "lg:min-h-[500px]" : ""}`}
                  >
                    {image ? (
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.035]"
                        style={{ backgroundImage: `url(${image})` }}
                      />
                    ) : (
                      <div className="tech-grid absolute inset-0" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-[#f26422]">
                        {project.city.name}
                        {project.service ? ` · ${project.service.name}` : ""}
                      </div>
                      <div className="mt-3 max-w-xl text-2xl font-black uppercase tracking-[-0.04em] md:text-3xl">
                        {project.title}
                      </div>
                      <p className="mt-3 max-w-xl line-clamp-2 text-sm leading-6 text-white/60">
                        {project.problem}
                      </p>
                    </div>
                    <div className="absolute right-5 top-5 grid size-12 place-items-center rounded-full bg-white text-lg font-black text-[#171714] transition group-hover:bg-[#f26422] group-hover:text-white"></div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="tech-grid rounded-[18px] border border-white/10 p-8 md:p-12">
              <div className="text-2xl font-black">
                Les premières réalisations seront publiées ici.
              </div>
              {/* <p className="mt-3 max-w-xl text-white/60">Stan peut les ajouter directement depuis l’administration.</p> */}
            </div>
          )}
        </div>
      </section>

<section id="zone" className="bg-[#fffdf8] py-16 md:py-20">
  <div className="container grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">

    {/* Colonne gauche */}
    <div className="flex items-center">
      <div className="max-w-[520px]">
        <div className="eyebrow">
          Zone d’intervention
        </div>

        <h2
          className="
            mt-5
            text-[clamp(2.7rem,5vw,4.8rem)]
            font-black
            uppercase
            leading-[0.93]
            tracking-[-0.055em]
            text-[#171714]
          "
        >
          Triel et les communes voisines.
        </h2>

        <p
          className="
            mt-6
            max-w-lg
            text-[15px]
            leading-7
            text-black/50
          "
        >
          Une couverture locale volontairement resserrée pour préserver la
          réactivité et la qualité de suivi.
        </p>
      </div>
    </div>

    {/* Liste des villes */}
    <div className="border-t border-black/10">
      {cities.map((city) => (
        <Link
          key={city.id}
          href={
            city.isPrimary
              ? "/electricien-triel-sur-seine"
              : `/${city.slug}`
          }
          className="
            group
            flex
            items-center
            border-b
            border-black/10
            py-6
            transition-all
            duration-300
            md:py-7
            hover:pl-2
          "
        >
          <span
            className="
              text-xl
              font-black
              tracking-[-0.035em]
              text-[#171714]
              transition-colors
              duration-300
              group-hover:text-[#f26422]
              md:text-[1.45rem]
            "
          >
            {city.name}
          </span>
        </Link>
      ))}
    </div>

  </div>
</section>

      <section className="bg-[#f26422] py-10 text-white">
  <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div>
      <div className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
        Votre projet commence ici
      </div>

      <div className="mt-2 text-3xl font-black uppercase tracking-[-0.045em] md:text-4xl">
        Besoin d’un électricien ?
      </div>
    </div>

    <a
      href="#contact"
      className="
        inline-flex
        min-h-12
        items-center
        justify-center
        rounded-[10px]
        bg-[#171714]
        px-6
        text-sm
        font-black
        text-white
        transition
        hover:-translate-y-0.5
      "
    >
      Nous contacter
    </a>
  </div>
</section>
    </main>
  );
}
