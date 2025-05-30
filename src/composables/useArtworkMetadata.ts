import { ref, computed } from 'vue'
import type { ArtworkMetadata } from '../utils/downloader'

export function useArtworkMetadata(artworkId: string) {
  const metadata = ref<ArtworkMetadata | null>(null)
  const isLoading = ref(true)
  const error = ref<Error | null>(null)

  const isReady = computed(
    () => !isLoading.value && !error.value && metadata.value !== null,
  )

  async function fetchArtworkMetadata(): Promise<ArtworkMetadata> {
    try {
      isLoading.value = true
      error.value = null

      const url = `https://www.pixiv.net/ajax/illust/${artworkId}`
      const response = await fetch(url, { credentials: 'include' })

      if (!response.ok) {
        throw new Error(`Failed to fetch artwork metadata: ${response.status}`)
      }

      const data = await response.json()

      if (!data.body) {
        throw new Error('Invalid response format')
      }

      metadata.value = data.body as ArtworkMetadata
      return metadata.value
    } catch (err) {
      error.value =
        err instanceof Error ? err : new Error('Unknown error occurred')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  // Initialize metadata fetching
  const metadataPromise = fetchArtworkMetadata()

  return {
    metadata: computed(() => metadata.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    isReady,
    refetch: fetchArtworkMetadata,
    metadataPromise,
  }
}
