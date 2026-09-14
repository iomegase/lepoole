import { PrismaClient } from '@prisma/client'
import services from '../content/services.json'

const prisma = new PrismaClient()

const cities = [
  ['Triel-sur-Seine','electricien-triel-sur-seine',true,0],
  ['Verneuil-sur-Seine','electricien-verneuil-sur-seine',false,1],
  ['Vernouillet','electricien-vernouillet',false,2],
  ['Vaux-sur-Seine','electricien-vaux-sur-seine',false,3],
  ['Andrésy','electricien-andresy',false,4],
  ['Chanteloup-les-Vignes','electricien-chanteloup-les-vignes',false,5],
  ['Villennes-sur-Seine','electricien-villennes-sur-seine',false,6],
  ['Poissy','electricien-poissy',false,7],
  ['Les Mureaux','electricien-les-mureaux',false,8],
] as const

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: 'Le Poole Electric',
      founderName: 'Stan Le Poole',
      foundedYear: 2002,
      heroTitle: 'Électricien à Triel-sur-Seine depuis 2002',
      heroSubtitle: 'Dépannage, rénovation, tableaux électriques, domotique et installations connectées à Triel-sur-Seine et dans les communes voisines.',
      googleReviewCount: 1,
    },
  })

  for (const [name, slug, isPrimary, sortOrder] of cities) {
    await prisma.city.upsert({
      where: { slug },
      update: {},
      create: {
        name, slug, isPrimary, sortOrder,
        title: `Électricien ${name} — dépannage, rénovation et installations électriques`,
        intro: `Le Poole Electric intervient à ${name} pour les dépannages, rénovations et installations électriques, avec un ancrage local autour de Triel-sur-Seine depuis 2002.`,
        content: `Interventions chez les particuliers et professionnels : recherche de panne, remise en sécurité, rénovation de tableau, circuits électriques, équipements connectés et travaux d'amélioration.\n\nChaque page locale doit être enrichie avec de vraies interventions réalisées dans la commune afin de renforcer sa valeur locale et éviter le contenu générique.`,
      },
    })
  }

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: service,
    })
  }
}

main().finally(() => prisma.$disconnect())
