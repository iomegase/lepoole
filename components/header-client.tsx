'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type HeaderClientProps = {
  phone: string
}

const navigation = [
  {
    label: 'Triel-sur-Seine',
    href: '/electricien-triel-sur-seine',
  },
  {
    label: 'Services',
    href: '/#services',
  },
  {
    label: 'Réalisations',
    href: '/#realisations',
  },
  {
    label: 'Secteur',
    href: '/#zone',
  },
]

export function HeaderClient({ phone }: HeaderClientProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className="sticky top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
        <div
          className="
            container
            flex h-16 items-center justify-between
            rounded-2xl
            border border-black/[0.07]
            bg-[#f6f3ec]/85
            px-4
            shadow-[0_8px_40px_rgba(0,0,0,0.06)]
            backdrop-blur-2xl
            md:h-[72px]
            md:px-6
          "
        >
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="
              relative z-50
              flex items-center gap-3
              text-[15px] font-black
              tracking-[-0.03em]
              text-[#171717]
              sm:text-base
              md:text-lg
            "
          >
            <span
              className="
                flex size-9 items-center justify-center
                rounded-full
                bg-[#171717]
                text-[11px]
                font-bold
                text-white
              "
            >
              LP
            </span>

            <span className="text-[#171717]">
              LE POOLE
              <span className="ml-1 font-medium text-black/40">
                ELECTRIC
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  rounded-full
                  px-4 py-2
                  text-[13px]
                  font-semibold
                  !text-black/60
                  transition-all
                  duration-200
                  hover:bg-black/[0.05]
                  hover:!text-black
                "
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="
                  group
                  flex h-12 items-center gap-3
                  rounded-full
                  bg-[#171717]
                  py-1.5 pl-5 pr-1.5
                  text-sm
                  font-semibold
                  !text-white
                  transition-all
                  duration-300
                  hover:bg-black
                  hover:shadow-lg
                "
              >
                <span className="!text-white">
                  Appeler
                </span>

                <span
                  className="
                    flex size-9 items-center justify-center
                    rounded-full
                    bg-white
                    !text-black
                    transition-transform
                    duration-300
                    group-hover:rotate-[-8deg]
                  "
                >
                  <ArrowIcon />
                </span>
              </a>
            ) : (
              <Link
                href="/#contact"
                className="
                  flex h-12 items-center
                  rounded-full
                  bg-[#171717]
                  px-6
                  text-sm
                  font-semibold
                  !text-white
                  transition
                  hover:bg-black
                "
              >
                Contact
              </Link>
            )}
          </div>

          <button
            type="button"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="
              relative z-50
              flex size-11 items-center justify-center
              rounded-full
              bg-[#171717]
              !text-white
              transition-transform
              duration-300
              active:scale-95
              lg:hidden
            "
          >
            <span className="relative block h-4 w-5">
              <span
                className={`
                  absolute left-0 top-[2px]
                  block h-[1.5px] w-5
                  bg-current
                  transition-all duration-300
                  ${
                    open
                      ? 'translate-y-[6px] rotate-45'
                      : ''
                  }
                `}
              />

              <span
                className={`
                  absolute left-0 top-[8px]
                  block h-[1.5px] w-5
                  bg-current
                  transition-all duration-300
                  ${
                    open
                      ? 'scale-x-0 opacity-0'
                      : ''
                  }
                `}
              />

              <span
                className={`
                  absolute left-0 top-[14px]
                  block h-[1.5px] w-5
                  bg-current
                  transition-all duration-300
                  ${
                    open
                      ? '-translate-y-[6px] -rotate-45'
                      : ''
                  }
                `}
              />
            </span>
          </button>
        </div>
      </header>

      <div
        className={`
          fixed inset-0 z-40
          transition-all duration-500
          lg:hidden
          ${
            open
              ? 'visible opacity-100'
              : 'pointer-events-none invisible opacity-0'
          }
        `}
      >
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="
            absolute inset-0
            bg-black/20
            backdrop-blur-sm
          "
        />

        <div
          className={`
            absolute
            left-3 right-3 top-3
            flex
            min-h-[calc(100dvh-24px)]
            flex-col
            overflow-hidden
            rounded-[28px]
            bg-[#ebe6db]
            px-6 pb-6 pt-28
            shadow-2xl
            transition-all
            duration-500
            ease-[cubic-bezier(.22,1,.36,1)]
            ${
              open
                ? 'translate-y-0 scale-100'
                : '-translate-y-5 scale-[0.97]'
            }
          `}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="
                absolute -right-24 top-24
                size-72 rounded-full
                bg-white/40 blur-3xl
              "
            />

            <div
              className="
                absolute -bottom-24 -left-20
                size-64 rounded-full
                bg-[#d2cbbd]/60 blur-3xl
              "
            />
          </div>

          <nav className="relative flex flex-col">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="
                  group
                  flex items-center justify-between
                  border-b border-black/10
                  py-5
                  !text-[#171717]
                  transition
                "
              >
                <span
                  className="
                    text-[clamp(1.8rem,7.5vw,2.8rem)]
                    font-semibold
                    leading-none
                    tracking-[-0.05em]
                    !text-[#171717]
                  "
                >
                  {item.label}
                </span>

                <span
                  className="
                    flex size-9 items-center justify-center
                    rounded-full
                    border border-black/15
                    text-[10px]
                    !text-black/45
                    transition-all
                    duration-300
                    group-hover:bg-black
                    group-hover:!text-white
                  "
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
              </Link>
            ))}
          </nav>

          <div className="relative mt-auto pt-8">
            <p
              className="
                mb-4
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-black/40
              "
            >
              Électricien · Triel-sur-Seine
            </p>

            {phone ? (
              <a
                href={`tel:${phone}`}
                className="
                  flex h-[72px] w-full
                  items-center justify-between
                  rounded-[22px]
                  bg-[#171717]
                  px-5
                  !text-white
                  transition-all
                  duration-300
                  active:scale-[0.99]
                "
              >
                <span
                  className="
                    text-[17px]
                    font-semibold
                    !text-white
                  "
                >
                  Nous appeler
                </span>

                <span
                  className="
                    flex size-12 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-white
                    !text-black
                  "
                >
                  <PhoneIcon />
                </span>
              </a>
            ) : (
              <Link
                href="/#contact"
                onClick={() => setOpen(false)}
                className="
                  flex h-[72px] w-full
                  items-center justify-between
                  rounded-[22px]
                  bg-[#171717]
                  px-5
                  !text-white
                "
              >
                <span className="text-[17px] font-semibold !text-white">
                  Nous contacter
                </span>

                <span
                  className="
                    flex size-12 items-center justify-center
                    rounded-full
                    bg-white
                    !text-black
                  "
                >
                  <ArrowIcon />
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 11L11 4M6 4H11V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22 16.92V20A2 2 0 0 1 19.82 22
        19.79 19.79 0 0 1 11.19 18.93
        19.5 19.5 0 0 1 5.15 12.58
        19.79 19.79 0 0 1 1.18 4.18
        2 2 0 0 1 3.17 2H6.28
        A2 2 0 0 1 8.28 3.72
        C8.4 4.68 8.63 5.62 8.96 6.52
        A2 2 0 0 1 8.51 8.63L7.19 9.95
        A16 16 0 0 0 14.05 16.81
        L15.37 15.49
        A2 2 0 0 1 17.48 15.04
        C18.38 15.37 19.32 15.6 20.28 15.72
        A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}