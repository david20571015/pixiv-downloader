/**
 * Pixiv API service for artwork metadata fetching
 */
import { PIXIV_CONFIG } from '@/entrypoints/content/constants'

/**
 * Available image sizes for Pixiv artworks
 */
export interface ArtworkUrls {
  readonly mini: string
  readonly thumb: string
  readonly small: string
  readonly regular: string
  readonly original: string
}

/**
 * Artwork metadata from Pixiv API
 */
export interface ArtworkMetadata {
  readonly title: string
  readonly id: string
  readonly userName: string
  readonly userId: string
  readonly userAccount: string
  readonly urls: ArtworkUrls
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
 * Interface for API response validation
 */
interface ApiResponseValidator {
  validate(data: unknown): boolean
  getValidationError(): string
}

/**
 * Validates Pixiv API response structure
 */
class PixivApiResponseValidator implements ApiResponseValidator {
  private validationError = ''

  validate(data: unknown): boolean {
    if (!data || typeof data !== 'object') {
      this.validationError = 'Invalid response: not an object'
      return false
    }

    if (!('body' in data)) {
      this.validationError = 'Invalid response format: missing body'
      return false
    }

    return true
  }

  getValidationError(): string {
    return this.validationError
  }
}

/**
 * Service for interacting with Pixiv API
 * Follows Single Responsibility Principle
 */
export class PixivApiService {
  private readonly validator: ApiResponseValidator

  constructor(validator?: ApiResponseValidator) {
    this.validator = validator ?? new PixivApiResponseValidator()
  }

  /**
   * Fetch artwork metadata from Pixiv API
   * @param artworkId - The artwork ID to fetch metadata for
   * @returns Promise resolving to artwork metadata
   * @throws {PixivApiError} when API request fails or response is invalid
   */
  async fetchArtworkMetadata(artworkId: string): Promise<ArtworkMetadata> {
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

      const data: unknown = await response.json()

      if (!this.validator.validate(data)) {
        throw new PixivApiError(
          this.validator.getValidationError(),
          undefined,
          url,
        )
      }

      return (data as { body: ArtworkMetadata }).body
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
