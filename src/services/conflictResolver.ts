import { saveDocToCloud } from './cloudSync'

/**
 * Optimistic Write helper with automatic rollback on error.
 */
export async function optimisticWrite<T extends { id: string; userId: string }>(
  collectionName: string,
  data: T,
  rollback: () => void,
  onError?: (err: Error) => void
): Promise<void> {
  try {
    await saveDocToCloud(collectionName, data)
  } catch (err: any) {
    rollback()
    if (onError) onError(err)
  }
}
