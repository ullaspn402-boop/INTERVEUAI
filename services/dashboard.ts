import { getUserAnalytics } from '@/services/analytics'

export async function getDashboardData(userId: string) {
  return getUserAnalytics(userId)
}
