import { db } from '@/lib/db'

export async function getAllSubjects() {
  const subjects = await db.subject.findMany({
    orderBy: { displayOrder: 'asc' },
    select: {
      id: true,
      name: true,
      shortTitle: true,
      slug: true,
      description: true,
      category: true,
      displayOrder: true,
      _count: {
        select: { topics: true },
      },
    },
  })

  return subjects.map((s) => ({
    id: s.id,
    name: s.name,
    shortTitle: s.shortTitle,
    slug: s.slug,
    description: s.description,
    category: s.category,
    displayOrder: s.displayOrder,
    topicCount: s._count.topics,
  }))
}

export async function getSubjectBySlugOrId(idOrSlug: string) {
  const subject = await db.subject.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
    },
    include: {
      topics: {
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          displayOrder: true,
        },
      },
    },
  })

  if (!subject) return null

  return {
    id: subject.id,
    name: subject.name,
    shortTitle: subject.shortTitle,
    slug: subject.slug,
    description: subject.description,
    category: subject.category,
    displayOrder: subject.displayOrder,
    topicCount: subject.topics.length,
    topics: subject.topics,
  }
}
