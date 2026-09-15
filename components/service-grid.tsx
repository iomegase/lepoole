import Link from 'next/link'
import {
  BellRing,
  BatteryCharging,
  AirVent,
  Wrench,
  Wifi,
  PhoneCall,
  Fence,
  Hammer,
  Cable,
  CircuitBoard,
} from 'lucide-react'

import { getServices } from '@/lib/data'

const SERVICE_ICONS = {
  Alarme: BellRing,
  'Borne de recharge / IRVE': BatteryCharging,
  Climatisation: AirVent,
  'Dépannage électrique': Wrench,
  Domotique: Wifi,
  Interphone: PhoneCall,
  'Motorisation de portail': Fence,
  'Rénovation électrique': Hammer,
  'Réseau RJ45': Cable,
  'Tableau électrique': CircuitBoard,
}

export async function ServiceGrid() {
  const services = await getServices()

  return (
    <div
      className="
        flex
        snap-x
        snap-mandatory
        gap-4
        overflow-x-auto
        overscroll-x-contain
        [scrollbar-width:none]
        [-ms-overflow-style:none]
        [&::-webkit-scrollbar]:hidden

        md:grid
        md:grid-cols-2
        md:gap-6
        md:overflow-visible

        xl:grid-cols-4
      "
    >
      {services.map((service) => {
        const Icon =
          SERVICE_ICONS[service.name as keyof typeof SERVICE_ICONS]

        return (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            className="
              group

              min-h-[220px]
              min-w-[82vw]
              max-w-[82vw]
              snap-start

              rounded-[20px]
              border
              border-black/6
              bg-white
              p-5

              shadow-[0_18px_50px_rgba(0,0,0,0.06)]

              transition-all
              duration-300

              hover:-translate-y-1
              hover:shadow-[0_24px_60px_rgba(0,0,0,0.10)]

              md:min-h-[250px]
              md:min-w-0
              md:max-w-none
              md:rounded-[24px]
              md:p-8
            "
          >
            <div className="flex h-full items-center gap-4 md:gap-5">
              {Icon && (
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center

                    rounded-xl
                    bg-[#f6f3ec]

                    transition-all
                    duration-300

                    group-hover:scale-105

                    md:h-14
                    md:w-14
                    md:rounded-2xl
                  "
                >
                  <Icon
                    strokeWidth={1.7}
                    className="
                      h-[22px]
                      w-[22px]
                      text-[#171714]

                      transition-colors
                      duration-300

                      group-hover:text-[#bd9254]

                      md:h-[26px]
                      md:w-[26px]
                    "
                  />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3
                  className="
                    text-[1.25rem]
                    font-black
                    leading-[1.1]
                    tracking-[-0.04em]
                    text-[#171714]

                    md:text-[1.4rem]
                  "
                >
                  {service.name}
                </h3>

                <p
                  className="
                    mt-4
                    line-clamp-4
                    text-[13px]
                    leading-6
                    text-black/50
                  "
                >
                  {service.excerpt}
                </p>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}