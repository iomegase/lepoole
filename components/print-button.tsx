'use client'

export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold print:hidden">Imprimer / enregistrer en PDF</button>
}
