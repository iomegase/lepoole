#!/usr/bin/env python3
"""Réinitialise le mot de passe admin sans l'afficher ni le passer en argument."""

from getpass import getpass
from pathlib import Path
import re
import subprocess
import sys


root = Path(__file__).resolve().parent.parent
env_file = root / '.env'

if not env_file.is_file():
    sys.exit('Fichier .env introuvable à la racine du projet.')

password = getpass('Nouveau mot de passe admin : ')
confirmation = getpass('Confirmer le mot de passe : ')
if not password or password != confirmation:
    sys.exit('Mot de passe vide ou confirmation différente. Aucun changement effectué.')

hash_result = subprocess.run(
    ['node', '-e', 'const fs=require("node:fs");const bcrypt=require("bcryptjs");process.stdout.write(bcrypt.hashSync(fs.readFileSync(0,"utf8"),12))'],
    input=password,
    text=True,
    capture_output=True,
    cwd=root,
    check=True,
)
hash_value = hash_result.stdout
if not re.fullmatch(r'\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}', hash_value):
    sys.exit('Le hash généré est invalide. Aucun changement effectué.')

original = env_file.read_text()
replacement = 'ADMIN_PASSWORD_HASH="' + hash_value.replace('$', r'\$') + '"'
if re.search(r'^ADMIN_PASSWORD_HASH=.*$', original, flags=re.MULTILINE):
    updated = re.sub(r'^ADMIN_PASSWORD_HASH=.*$', lambda _: replacement, original, count=1, flags=re.MULTILINE)
else:
    updated = original.rstrip() + '\n' + replacement + '\n'
env_file.write_text(updated)

verification = subprocess.run(
    ['node', '-e', 'require("@next/env").loadEnvConfig(process.cwd(),true);const fs=require("node:fs");const bcrypt=require("bcryptjs");process.exit(bcrypt.compareSync(fs.readFileSync(0,"utf8"),process.env.ADMIN_PASSWORD_HASH||"")?0:1)'],
    input=password,
    text=True,
    cwd=root,
)
if verification.returncode:
    env_file.write_text(original)
    sys.exit('Vérification impossible : le fichier .env précédent a été restauré.')

print('Hash admin remplacé et vérifié. Redémarre le serveur Next.js avant de te connecter.')
