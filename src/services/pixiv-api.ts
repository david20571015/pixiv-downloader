/**
 * Pixiv API service for artwork metadata fetching
 */
import { PIXIV_CONFIG } from '@/entrypoints/content/constants'

/**
 * Available image sizes for Pixiv artworks
 */
export interface ArtworkUrls {
  mini: string
  thumb: string
  small: string
  regular: string
  original: string
}

/**
 * Artwork metadata from Pixiv API
 */
export interface ArtworkMetadata {
  title: string
  id: string
  userName: string
  userId: string
  userAccount: string
  urls: ArtworkUrls
}

/**
 * Custom error class for Pixiv API related errors
 */
export class PixivApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly url?: string,
  ) {
    super(message)
    this.name = 'PixivApiError'
  }
}

/**
 * Service for interacting with Pixiv API
 */
export class PixivApiService {
  /**
   * Fetch artwork metadata from Pixiv API
   * @param artworkId - The artwork ID to fetch metadata for
   * @returns Promise resolving to artwork metadata
   * @throws PixivApiError when API request fails
   */
  static async fetchArtworkMetadata(
    artworkId: string,
  ): Promise<ArtworkMetadata> {
    const url = `${PIXIV_CONFIG.API_BASE_URL}/${artworkId}`

    try {
      const response = await fetch(url, { credentials: 'include' })

      if (!response.ok) {
        throw new PixivApiError(
          `Failed to fetch artwork metadata: ${response.status} (${response.statusText})`,
          response.status,
          url,
        )
      }

      const data = await response.json()

      if (!data.body) {
        throw new PixivApiError(
          'Invalid response format: missing body',
          undefined,
          url,
        )
      }

      return data.body as ArtworkMetadata
    } catch (error) {
      if (error instanceof PixivApiError) {
        throw error
      }

      // Handle network errors or other fetch failures
      throw new PixivApiError(
        `Network error while fetching artwork metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        url,
      )
    }
  }
}
