import Link from 'next/link'
import { getServices } from '@/lib/data'

export async function ServiceGrid() {
  const services = await getServices()

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {services.map((service) => (
        <Link
          key={service.id}
          href={`/services/${service.slug}`}
          className="
            group
            min-h-[250px]
            rounded-[24px]
            border border-black/6
            bg-white
            p-7
            shadow-[0_18px_50px_rgba(0,0,0,0.06)]
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-[0_24px_60px_rgba(0,0,0,0.10)]
            md:p-8
          "
        >
          <div className="flex h-full flex-col justify-center">
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
                text-[14px]
                leading-6
                text-black/50
                md:text-[15px]
              "
            >
              {service.excerpt}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}