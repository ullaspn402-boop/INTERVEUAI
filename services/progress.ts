import { db } from '@/lib/db'
import { TopicProgressStatus, ActivityType } from '@prisma/client'

export async function getUserSubjectProgress(userId: string) {
  // Fetch all subjects
  const subjects = await db.subject.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      topics: {
        select: { id: true, name: true },
        orderBy: { displayOrder: 'asc' },
      },
    },
  })

  // Fetch user progress records
  const userProgresses = await db.userProgress.findMany({
    where: { userId },
  })

  const progressMap = new Map(userProgresses.map((p) => [p.subjectId, p]))

  // Fetch topic progress records for this user to identify next topics
  const topicProgresses = await db.topicProgress.findMany({
    where: { userId },
    select: { topicId: true, status: true },
  })

  const completedTopicIds = new Set(
    topicProgresses.filter((tp) => tp.status === 'COMPLETED').map((tp) => tp.topicId)
  )

  return subjects.map((sub) => {
    const p = progressMap.get(sub.id)
    const totalTopics = sub.topics.length
    const completedTopics = sub.topics.filter((t) => completedTopicIds.has(t.id)).length
    const calculatedProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

    // Determine next topic
    const nextTopic = sub.topics.find((t) => !completedTopicIds.has(t.id))

    return {
      subjectId: sub.id,
      slug: sub.slug,
      title: sub.shortTitle,
      full: sub.name,
      category: sub.category,
      value: p ? Math.round(p.progress) : calculatedProgress,
      completedTopics: p ? p.completedTopics : completedTopics,
      totalTopics: p ? p.totalTopics : totalTopics,
      detail: `${completedTopics} of ${totalTopics} topics`,
      nextTopicName: nextTopic ? nextTopic.name : 'Completed',
      lastActivityAt: p?.lastActivityAt ? p.lastActivityAt.toISOString() : null,
    }
  })
}

export async function updateTopicProgress(
  userId: string,
  topicId: string,
  status: TopicProgressStatus
) {
  // 1. Verify topic exists
  const topic = await db.topic.findUnique({
    where: { id: topicId },
    include: { subject: true },
  })

  if (!topic) {
    throw new Error('Topic not found')
  }

  const completedAt = status === 'COMPLETED' ? new Date() : null
  const progressVal = status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0

  // 2. Upsert TopicProgress in transaction
  const result = await db.$transaction(async (tx) => {
    // Upsert topic progress
    const tp = await tx.topicProgress.upsert({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
      update: {
        status,
        progress: progressVal,
        completedAt,
      },
      create: {
        userId,
        topicId,
        status,
        progress: progressVal,
        completedAt,
      },
    })

    // Count all topics for this subject
    const totalSubjectTopics = await tx.topic.count({
      where: { subjectId: topic.subjectId },
    })

    // Count completed topics for this user & subject
    const completedSubjectTopics = await tx.topicProgress.count({
      where: {
        userId,
        status: 'COMPLETED',
        topic: { subjectId: topic.subjectId },
      },
    })

    const subjectProgressPercent =
      totalSubjectTopics > 0 ? (completedSubjectTopics / totalSubjectTopics) * 100 : 0

    // Upsert UserProgress for the subject
    const up = await tx.userProgress.upsert({
      where: {
        userId_subjectId: {
          userId,
          subjectId: topic.subjectId,
        },
      },
      update: {
        progress: subjectProgressPercent,
        completedTopics: completedSubjectTopics,
        totalTopics: totalSubjectTopics,
        lastActivityAt: new Date(),
      },
      create: {
        userId,
        subjectId: topic.subjectId,
        progress: subjectProgressPercent,
        completedTopics: completedSubjectTopics,
        totalTopics: totalSubjectTopics,
        lastActivityAt: new Date(),
      },
    })

    // Create Activity if completed or in progress
    if (status === 'COMPLETED') {
      await tx.activity.create({
        data: {
          userId,
          type: ActivityType.TOPIC_COMPLETED,
          title: `Completed ${topic.name}`,
          description: `Finished topic in ${topic.subject.name}`,
          metadata: {
            topicId: topic.id,
            topicSlug: topic.slug,
            subjectId: topic.subjectId,
            subjectSlug: topic.subject.slug,
          },
        },
      })
    } else if (status === 'IN_PROGRESS') {
      await tx.activity.create({
        data: {
          userId,
          type: ActivityType.SUBJECT_STARTED,
          title: `Started ${topic.name}`,
          description: `Began studying topic in ${topic.subject.name}`,
          metadata: {
            topicId: topic.id,
            topicSlug: topic.slug,
            subjectId: topic.subjectId,
            subjectSlug: topic.subject.slug,
          },
        },
      })
    }

    return { topicProgress: tp, userProgress: up, subject: topic.subject }
  })

  return result
}
