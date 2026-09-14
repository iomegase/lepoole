import { getSettings } from '@/lib/data'
import { HeaderClient } from '@/components/header-client'

export async function SiteHeader() {
  const settings = await getSettings()

  const phone =
    settings.phone ||
    process.env.NEXT_PUBLIC_PHONE ||
    ''

  return <HeaderClient phone={phone} />
}