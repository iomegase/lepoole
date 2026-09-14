import Link from 'next/link'
import { getCities, getServices, getSettings } from '@/lib/data'

export async function SiteFooter() {
  const [cities, services, settings] = await Promise.all([
    getCities(),
    getServices(),
    getSettings(),
  ])

  return (
    <footer id="contact" className="bg-[#171714] text-white">
      <div className="container py-14 md:py-20">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.25fr_.75fr_.75fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[10px] bg-[#f26422] text-xs font-black">LP</span>
              <div>
                <div className="text-lg font-black tracking-[-0.04em]">{settings.companyName}</div>
                <div className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">Triel-sur-Seine</div>
              </div>
            </div>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
              Électricité générale, rénovation, dépannage et équipements connectés depuis {settings.foundedYear}.
            </p>
            {settings.phone && <a className="mt-6 block text-xl font-black text-[#f26422]" href={`tel:${settings.phone}`}>{settings.phone}</a>}
            {settings.email && <a className="mt-2 block text-sm text-white/60" href={`mailto:${settings.email}`}>{settings.email}</a>}
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Services</h3>
            <div className="mt-5 grid gap-3 text-sm font-bold text-white/65">
              {services.slice(0, 6).map((service) => (
                <Link key={service.id} href={`/services/${service.slug}`} className="transition hover:text-[#f26422]">{service.name}</Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Secteur</h3>
            <div className="mt-5 grid gap-3 text-sm font-bold text-white/65">
              {cities.slice(0, 6).map((city) => (
                <Link key={city.id} href={city.isPrimary ? '/electricien-triel-sur-seine' : `/${city.slug}`} className="transition hover:text-[#f26422]">{city.name}</Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">Confiance locale</h3>
            <p className="mt-5 text-sm leading-6 text-white/50">
              Des réalisations documentées, des interventions locales et un contact direct avec l’entreprise.
            </p>
            {settings.googleReviewUrl && (
              <a href={settings.googleReviewUrl} rel="noopener noreferrer" target="_blank" className="mt-6 inline-flex rounded-[10px] border border-white/15 px-4 py-3 text-sm font-black transition hover:border-[#f26422] hover:text-[#f26422]">
                Avis Google ↗
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {settings.companyName}</span>
          <span>Électricien · Triel-sur-Seine · Yvelines</span>
        </div>
      </div>
    </footer>
  )
}
