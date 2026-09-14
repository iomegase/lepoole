# Le Poole Electric — module Devis

Ce bundle ajoute au repo `iomegase/lepoole` :

- `/demande-de-devis` : formulaire client en 3 étapes, avec jusqu’à 5 photos privées ;
- `/admin/devis` : demandes entrantes, devis et statuts ;
- `/admin/catalogue` : catalogue de prestations modifiable par Stan ;
- prix client HT + coût fournisseur HT pour calcul interne de marge ;
- règles TVA par contexte de chantier, avec taux conservé ligne par ligne dans le devis ;
- création d’un devis depuis une demande ;
- lien client privé `/devis/[token]` ;
- acceptation/refus en ligne ;
- certification TVA demandée lorsqu’un taux réduit est présent ;
- impression navigateur / « Enregistrer en PDF » ;
- photos stockées dans un bucket Supabase Storage privé.

## Installation

Place le dossier du bundle où tu veux, ouvre un terminal dans la racine du repo `lepoole`, puis lance :

```bash
python3 /chemin/vers/lepoole-devis-module/apply_patch.py
```

Le script sauvegarde automatiquement les fichiers existants qu’il remplace dans `.devis-backup-YYYYMMDD-HHMMSS`.

## Supabase Storage

Dans Supabase > Storage, créer un bucket **privé** nommé :

```text
quote-requests
```

Ajouter dans `.env` / `.env.local` et dans les variables Vercel :

```env
SUPABASE_URL="https://PROJECT_REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_QUOTE_BUCKET="quote-requests"
```

`SUPABASE_SERVICE_ROLE_KEY` reste strictement côté serveur. Ne jamais utiliser le préfixe `NEXT_PUBLIC_` pour cette clé.

## Migration

```bash
npm run prisma:deploy
npm run prisma:generate
npm run dev
```

Puis tester :

```text
http://localhost:3000/demande-de-devis
http://localhost:3000/admin/catalogue
http://localhost:3000/admin/devis
```

## TVA

Le catalogue contient des **règles proposées**, pas une décision fiscale automatique. Les valeurs initiales sont volontairement prudentes :

- construction neuve : 20 % ;
- rénovation logement > 2 ans : 10 % ;
- logement < 2 ans : 20 % ;
- rénovation énergétique : 20 % par défaut, à passer à 5,5 % uniquement pour les prestations réellement éligibles ;
- autre : 20 %.

Stan peut modifier ces règles prestation par prestation. Lorsqu’une prestation est ajoutée à un devis, son prix et son taux sont copiés dans `QuoteItem` : une modification ultérieure du catalogue ne change jamais un ancien devis.

## Avant mise en production

Faire valider les mentions légales du devis, les conditions de paiement, la formulation de certification TVA et les règles exactes de taux réduits adaptées à l’activité de l’entreprise. Ajouter ensuite, si souhaité, un envoi email automatique et une génération PDF serveur.
