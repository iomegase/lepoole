# Le Poole Electric

Site Next.js 16 orienté conversion + SEO local pour **Le Poole Electric**, avec administration privée pour Stan Le Poole.

## Architecture SEO

- `/electricien-triel-sur-seine` : page principale de conquête.
- Pages locales : Verneuil-sur-Seine, Vernouillet, Vaux-sur-Seine, Andrésy, Chanteloup-les-Vignes, Villennes-sur-Seine, Poissy, Les Mureaux.
- Pages services : tableau électrique, rénovation électrique, dépannage, domotique, interphone, alarme, réseau RJ45, motorisation de portail, IRVE.
- `/realisations/[slug]` : chantiers locaux avec ville, spécialité, problématique, travaux, résultat et photos avant/après.
- Sitemap et robots dynamiques.
- JSON-LD `Electrician` sur la home + `Article` sur les réalisations.

## Administration

Routes :

- `/admin/login`
- `/admin`

L’admin permet de :

- modifier les informations générales et les CTA ;
- renseigner téléphone, email, adresse et données Google Business Profile ;
- modifier et publier/masquer chaque page ville ;
- modifier et publier/masquer chaque page service ;
- créer, modifier, publier/masquer et supprimer les réalisations ;
- renseigner des URLs de photos avant/après.

## Installation

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

## Variables d’environnement

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
ADMIN_EMAIL="stan@example.com"
ADMIN_PASSWORD_HASH="$2b$12$replace_me"
AUTH_SECRET="replace-with-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="https://lepoole-electric.fr"
NEXT_PUBLIC_PHONE="+33100000000"
NEXT_PUBLIC_EMAIL="contact@lepoole-electric.fr"
```

Pour produire le hash du mot de passe admin :

```bash
node -e "console.log(require('bcryptjs').hashSync('VOTRE_MOT_DE_PASSE', 12))"
```

Pour générer `AUTH_SECRET` :

```bash
openssl rand -base64 32
```

## Base de données

Le projet utilise Prisma + PostgreSQL. Supabase Postgres, Neon ou Vercel Postgres conviennent.

En production :

```bash
npm run prisma:deploy
npm run prisma:seed
```

## Important — IRVE

La page IRVE est incluse dans les données initiales, mais elle ne doit être publiée/commercialisée que si Le Poole Electric possède bien la qualification nécessaire aux prestations concernées. Elle peut être masquée depuis `/admin`.

## Suite recommandée

1. Connecter un vrai domaine et Google Search Console.
2. Connecter GA4 et suivre les clics téléphone / demande de devis / avis Google.
3. Ajouter Supabase Storage ou Vercel Blob pour uploader directement les photos au lieu de coller des URLs.
4. Publier au moins 10 réalisations réelles, en privilégiant Triel-sur-Seine.
5. Faire progresser le profil Google Business de 1 → 20 → 50 avis.
