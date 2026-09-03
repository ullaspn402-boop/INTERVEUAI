import { db } from '@/lib/db'

export async function getUserActivities(userId: string, limit: number = 10) {
  const safeLimit = Math.min(Math.max(limit, 1), 50)

  const activities = await db.activity.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: safeLimit,
  })

  return activities.map((act) => {
    const daysAgo = Math.max(
      0,
      Math.floor((Date.now() - new Date(act.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    )

    return {
      id: act.id,
      type: act.type,
      title: act.title,
      description: act.description,
      createdAt: act.createdAt.toISOString(),
      daysAgo,
      formattedDaysAgo: daysAgo === 0 ? 'Today' : `${daysAgo}d ago`,
    }
  })
}
