import { loginAction } from './actions'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  return <main className="min-h-screen grid place-items-center bg-[#101820] p-6">
    <form action={loginAction} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <div className="text-sm font-bold uppercase tracking-[.18em] text-black/40">Le Poole Electric</div>
      <h1 className="mt-3 text-3xl font-black">Administration</h1>
      <p className="mt-2 text-black/55">Connexion réservée à Stan.</p>
      {error && <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Identifiants incorrects.</div>}
      <label className="mt-6 block text-sm font-bold">Email<input name="email" type="email" required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3" /></label>
      <label className="mt-4 block text-sm font-bold">Mot de passe<input name="password" type="password" required className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3" /></label>
      <button className="mt-6 w-full rounded-xl bg-[#101820] px-4 py-3 font-bold text-white">Se connecter</button>
    </form>
  </main>
}
