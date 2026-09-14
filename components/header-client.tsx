"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type HeaderClientProps = {
  phone: string;
};

const navigation = [
  { label: "Accueil", href: "/" },
  { label: "Services", href: "/#services" },
  { label: "Réalisations", href: "/#realisations" },
  { label: "Secteur", href: "/#zone" },
];

export function HeaderClient({ phone }: HeaderClientProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-black/[0.08] bg-[#f4f0e7]/95 backdrop-blur-xl">
        <div className="container flex h-[76px] items-center justify-between gap-5">
          {/* LOGO */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-3"
          >
            <span
              className="
                grid
                size-10
                place-items-center
                rounded-[10px]
                bg-[#f26422]
                text-[12px]
                font-black
                tracking-[-0.05em]
                text-white
                transition-transform
                duration-300
                group-hover:-rotate-3
              "
            >
              LP
            </span>

            <span className="leading-none">
              <span className="block text-[15px] font-black tracking-[-0.035em] text-[#171714] sm:text-base">
                LE POOLE
              </span>

              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">
                Electric
              </span>
            </span>
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="
                  rounded-lg
                  px-4
                  py-2.5
                  text-[12px]
                  font-extrabold
                  uppercase
                  tracking-[0.08em]
                  text-black/60
                  transition
                  hover:bg-white/70
                  hover:text-black
                "
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ACTIONS DESKTOP */}
          <div className="hidden items-center gap-3 lg:flex">
            {phone && (
              <a
                href={`tel:${phone}`}
                aria-label={`Appeler ${phone}`}
                title={`Appeler ${phone}`}
                className="
                  grid
                  size-11
                  place-items-center
                  rounded-full
                  bg-[#f26422]
                  !text-white
                  shadow-[0_10px_30px_rgba(242,100,34,0.18)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#ff7432]
                  hover:shadow-[0_14px_35px_rgba(242,100,34,0.25)]
                "
              >
                <PhoneIcon />
              </a>
            )}

            <a
              href={phone ? `tel:${phone}` : "/#contact"}
              className="
                flex
                h-11
                items-center
                rounded-[10px]
                bg-[#f26422]
                px-5
                text-sm
                font-black
                !text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#ff7432]
              "
            >
              Devis & dépannage
            </a>
          </div>

          {/* BURGER MOBILE */}
          <button
            type="button"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="
              relative
              z-[60]
              grid
              size-11
              place-items-center
              rounded-[10px]
              border
              border-black/10
              bg-white/70
              text-[#171714]
              shadow-sm
              transition
              active:scale-95
              lg:hidden
            "
          >
            <span className="relative block h-4 w-5">
              <span
                className={`
                  absolute
                  left-0
                  top-[2px]
                  h-[1.5px]
                  w-5
                  bg-current
                  transition-all
                  duration-300
                  ${
                    open
                      ? "translate-y-[6px] rotate-45"
                      : ""
                  }
                `}
              />

              <span
                className={`
                  absolute
                  left-0
                  top-[8px]
                  h-[1.5px]
                  w-5
                  bg-current
                  transition-all
                  duration-300
                  ${
                    open
                      ? "scale-x-0 opacity-0"
                      : ""
                  }
                `}
              />

              <span
                className={`
                  absolute
                  left-0
                  top-[14px]
                  h-[1.5px]
                  w-5
                  bg-current
                  transition-all
                  duration-300
                  ${
                    open
                      ? "-translate-y-[6px] -rotate-45"
                      : ""
                  }
                `}
              />
            </span>
          </button>
        </div>
      </header>

      {/* MENU MOBILE */}
      <div
        className={`
          fixed
          inset-0
          z-40
          transition-all
          duration-300
          lg:hidden
          ${
            open
              ? "visible opacity-100"
              : "pointer-events-none invisible opacity-0"
          }
        `}
      >
        {/* BACKDROP */}
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* DRAWER */}
        <div
          className={`
            absolute
            inset-x-3
            top-3
            flex
            min-h-[calc(100dvh-24px)]
            flex-col
            overflow-hidden
            rounded-[24px]
            bg-[#f4f0e7]
            px-6
            pb-6
            pt-24
            shadow-2xl
            transition-all
            duration-500
            ease-[cubic-bezier(.22,1,.36,1)]
            ${
              open
                ? "translate-y-0 scale-100"
                : "-translate-y-4 scale-[0.98]"
            }
          `}
        >
          {/* DECORATION */}
          <div
            className="
              pointer-events-none
              absolute
              -right-24
              top-24
              size-64
              rounded-full
              bg-[#f26422]/10
              blur-3xl
            "
          />

          {/* LABEL */}
          {/* <div className="relative mb-8 text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
            Navigation
          </div> */}

          {/* NAVIGATION */}
          <nav className="relative flex flex-col">
            {navigation.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  border-b
                  border-black/10
                  py-5
                  text-[#171714]
                "
              >
                <span
                  className="
                    text-[clamp(2rem,8vw,3.2rem)]
                    font-black
                    leading-none
                    tracking-[-0.055em]
                  "
                >
                  {item.label}
                </span>

                <span className="text-xs font-black text-[#f26422]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
          </nav>

          {/* CONTACT MOBILE */}
          <div className="relative mt-auto pt-8">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-black/40">
              Triel-sur-Seine · Yvelines
            </div>

            {phone ? (
              <a
                href={`tel:${phone}`}
                className="
                  flex
                  h-[72px]
                  w-full
                  items-center
                  justify-between
                  rounded-[16px]
                  bg-[#171714]
                  px-5
                  !text-white
                  shadow-[0_14px_40px_rgba(0,0,0,0.14)]
                  transition-all
                  duration-300
                  active:scale-[0.99]
                "
              >
                <div>
                  <span
                    className="
                      block
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      !text-white/50
                    "
                  >
                    Contact direct
                  </span>

                  {/* <span
                    className="
                      mt-1
                      block
                      text-[17px]
                      font-black
                      !text-white
                    "
                  >
                    Nous appeler
                  </span> */}
                </div>

                <span
                  className="
                    grid
                    size-11
                    shrink-0
                    place-items-center
                    rounded-[12px]
                    bg-[#f26422]
                    !text-white
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
                  flex
                  h-[72px]
                  w-full
                  items-center
                  rounded-[16px]
                  bg-[#171714]
                  px-5
                  text-[17px]
                  font-black
                  !text-white
                "
              >
                Nous contacter
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="text-current"
    >
      <path
        d="
          M22 16.92V20
          A2 2 0 0 1 19.82 22
          19.79 19.79 0 0 1 11.19 18.93
          19.5 19.5 0 0 1 5.15 12.58
          19.79 19.79 0 0 1 1.18 4.18
          2 2 0 0 1 3.17 2
          H6.28
          A2 2 0 0 1 8.28 3.72
          C8.4 4.68 8.63 5.62 8.96 6.52
          A2 2 0 0 1 8.51 8.63
          L7.19 9.95
          A16 16 0 0 0 14.05 16.81
          L15.37 15.49
          A2 2 0 0 1 17.48 15.04
          C18.38 15.37 19.32 15.6 20.28 15.72
          A2 2 0 0 1 22 16.92
          Z
        "
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}