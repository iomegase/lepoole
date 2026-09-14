import Link from 'next/link'
import { getSettings } from '@/lib/data'

export async function SiteHeader() {
  const settings = await getSettings()
  const phone = settings.phone || process.env.NEXT_PUBLIC_PHONE || ''
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f6f3ec]/90 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4">
        <Link href="/" className="text-lg font-black tracking-tight md:text-xl">LE POOLE ELECTRIC</Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold lg:flex">
          <Link href="/electricien-triel-sur-seine">Triel-sur-Seine</Link>
          <Link href="/#services">Services</Link>
          <Link href="/#realisations">Réalisations</Link>
          <Link href="/#zone">Secteur</Link>
        </nav>
        {phone ? <a className="btn btn-dark whitespace-nowrap" href={`tel:${phone}`}>Appeler Stan</a> : <Link className="btn btn-dark" href="/#contact">Contact</Link>}
      </div>
    </header>
  )
}
