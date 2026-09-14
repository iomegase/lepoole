# Module de devis — état local

Le module est présent dans le dossier de travail. Aucun commit, push ou déploiement n’a été effectué par l’agent. Les modifications de présentation réalisées en parallèle par l’utilisateur sont conservées ; les liens publics vers le module ne sont pas réintroduits.

## Pages

- `/demande-de-devis` : coordonnées, projet, photos facultatives et consentement.
- `/admin/devis` : demandes et devis, accès administrateur.
- `/admin/catalogue` : prestations, prix HT, coûts internes et règles de TVA.
- `/admin/devis/demandes/[id]` : examen d’une demande et création du devis.
- `/admin/devis/[id]` : lignes, conditions, calculs et préparation du partage.
- `/devis/[token]` : consultation privée, impression et réponse du client.

Les prix et taux sont copiés dans les lignes. Un devis envoyé n’est plus éditable par les actions du module. La préparation du partage n’envoie aucun email : le lien doit être transmis manuellement. Aucun tarif commercial fictif n’a été ajouté au catalogue.

## Base de données

Les migrations `202609141330_add_quote_system` et `202609141400_quote_privacy` ont déjà été appliquées à la base Supabase configurée. Elles ajoutent les tables sans supprimer les données existantes. Les nouvelles tables ont RLS activé et aucun accès Data API public ; Prisma utilise la connexion serveur.

Pour une autre base, appliquer les migrations avec une connexion de session compatible. Le schéma actuel utilise `DATABASE_URL` ; la présence de `DIRECT_URL` seule ne change pas la connexion de Prisma CLI.

```sh
node --env-file=.env -e 'const {spawnSync}=require("node:child_process");const r=spawnSync("npm",["run","prisma:deploy"],{stdio:"inherit",env:{...process.env,DATABASE_URL:process.env.DIRECT_URL||process.env.DATABASE_URL}});process.exit(r.status??1)'
npm run prisma:generate
```

## Photos : configuration encore manquante

Renseigner côté serveur `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_QUOTE_BUCKET=quote-requests` et `AUTH_SECRET`. Créer un bucket Supabase Storage **privé** `quote-requests`. La clé de service ne doit jamais porter de préfixe `NEXT_PUBLIC_`.

La clé de service est actuellement absente : le formulaire permet d’envoyer une demande sans photo et indique que les photos sont indisponibles. Les photos sont accompagnées d’un justificatif signé avant leur association à une demande. Les liens de lecture sont signés et temporaires, accessibles depuis l’administration.

## Vérifications

- Build complet réussi, génération Prisma et TypeScript incluses.
- `node --import tsx --test tests/quotes.test.ts` : calculs, arrondis, valeurs invalides, transitions client et validité en heure française.
- La page publique du formulaire a été ouverte avec succès dans le navigateur.
- Le parcours complet (soumission, préparation admin, acceptation et impression) reste à vérifier : le contrôle automatique d’autorisation a bloqué la suite du test navigateur pour une limite d’utilisation.
- Aucun test d’envoi d’email ni de photos n’a été effectué.

Avant utilisation commerciale, vérifier les mentions et conditions de devis propres à l’entreprise ainsi que l’éligibilité effective aux taux de TVA, comme prévu dans le README du module fourni.
