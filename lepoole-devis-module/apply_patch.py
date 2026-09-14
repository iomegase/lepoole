#!/usr/bin/env python3
from pathlib import Path
import shutil
import sys
from datetime import datetime

bundle = Path(__file__).resolve().parent
overlay = bundle / 'overlay'
root = Path.cwd().resolve()

if not (root / 'package.json').exists() or not (root / 'prisma' / 'schema.prisma').exists():
    print('ERREUR: lance ce script depuis la racine du repo lepoole (là où se trouve package.json).')
    sys.exit(1)

stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
backup = root / f'.devis-backup-{stamp}'


def backup_file(path: Path):
    if not path.exists():
        return
    rel = path.relative_to(root)
    dest = backup / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, dest)


def write_text(path: Path, content: str):
    backup_file(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')

# 1) Copie des fichiers nouveaux / schema / migration.
for src in overlay.rglob('*'):
    if not src.is_file():
        continue
    rel = src.relative_to(overlay)
    dest = root / rel
    backup_file(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)

# 2) Ajoute la route devis au header existant.
header = root / 'components' / 'header-client.tsx'
if header.exists():
    s = header.read_text(encoding='utf-8')
    if "href: '/demande-de-devis'" not in s:
        needle = "  {\n    label: 'Secteur',\n    href: '/#zone',\n  },\n]"
        replacement = "  {\n    label: 'Secteur',\n    href: '/#zone',\n  },\n  {\n    label: 'Devis',\n    href: '/demande-de-devis',\n  },\n]"
        if needle not in s:
            print('ATTENTION: navigation du header non reconnue, lien Devis non ajouté automatiquement.')
        else:
            write_text(header, s.replace(needle, replacement, 1))

# 3) Ajoute Devis + Catalogue dans la barre d’admin existante.
admin = root / 'app' / 'admin' / 'page.tsx'
if admin.exists():
    s = admin.read_text(encoding='utf-8')
    if 'href="/admin/devis"' not in s:
        needle = '<div className="flex gap-2"><a href="/"'
        replacement = '<div className="flex flex-wrap gap-2"><a href="/admin/devis" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold">Devis</a><a href="/admin/catalogue" className="rounded-full border border-black/15 bg-white px-5 py-3 text-sm font-bold">Catalogue</a><a href="/"'
        if needle not in s:
            print('ATTENTION: barre admin non reconnue, liens Devis/Catalogue non ajoutés automatiquement.')
        else:
            write_text(admin, s.replace(needle, replacement, 1))

# 4) Référence la page de demande de devis dans le sitemap public.
sitemap = root / 'app' / 'sitemap.ts'
if sitemap.exists():
    s = sitemap.read_text(encoding='utf-8')
    if '/demande-de-devis' not in s:
        needle = '    { url: base, priority: 1 },\n'
        replacement = '    { url: base, priority: 1 },\n    { url: `${base}/demande-de-devis`, priority: .8 },\n'
        if needle not in s:
            print('ATTENTION: sitemap non reconnu, /demande-de-devis non ajouté automatiquement.')
        else:
            write_text(sitemap, s.replace(needle, replacement, 1))

# 5) Variables serveur pour les photos privées Supabase Storage.
env = root / '.env.example'
if env.exists():
    s = env.read_text(encoding='utf-8')
    if 'SUPABASE_SERVICE_ROLE_KEY' not in s:
        addition = '''\n# Photos privées des demandes de devis (Supabase Storage)\nSUPABASE_URL="https://PROJECT_REF.supabase.co"\nSUPABASE_SERVICE_ROLE_KEY="replace-with-service-role-key"\nSUPABASE_QUOTE_BUCKET="quote-requests"\n'''
        write_text(env, s.rstrip() + '\n' + addition)

print('\nModule devis installé dans le working tree.')
print(f'Sauvegarde des fichiers remplacés: {backup.name}')
print('\nÉtapes suivantes:')
print('  1. Configurer SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et créer un bucket privé quote-requests.')
print('  2. npm run prisma:deploy')
print('  3. npm run prisma:generate')
print('  4. npm run dev')
print('  5. Tester /demande-de-devis, /admin/catalogue et /admin/devis')
