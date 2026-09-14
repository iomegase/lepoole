import { siteUrl } from '@/lib/site-url'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Le Poole Electric — Électricien à Triel-sur-Seine depuis 2002', template: '%s | Le Poole Electric' },
  description: 'Électricien à Triel-sur-Seine depuis 2002 : dépannage, rénovation électrique, tableaux, domotique, interphone, alarme, réseau RJ45 et motorisation.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>
}
