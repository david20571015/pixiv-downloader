import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import {
  PixivApiService,
  PixivApiError,
  type ArtworkMetadata,
} from './pixiv-api'
import { PIXIV_CONFIG } from '@/entrypoints/content/constants'

describe('PixivApiService', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchArtworkMetadata', () => {
    const artworkId = '12345'
    const expectedUrl = `${PIXIV_CONFIG.API_BASE_URL}/${artworkId}`

    it('should fetch artwork metadata successfully', async () => {
      const mockResponseData: { body: ArtworkMetadata } = {
        body: {
          title: 'Test Artwork',
          id: artworkId,
          userName: 'Test User',
          userId: '67890',
          userAccount: 'testuser',
          urls: {
            mini: 'mini_url',
            thumb: 'thumb_url',
            small: 'small_url',
            regular: 'regular_url',
            original: 'original_url',
          },
        },
      }
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponseData,
      })

      const metadata =
        await PixivApiService.fetchArtworkMetadata(artworkId)

      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
        credentials: 'include',
      })
      expect(metadata).toEqual(mockResponseData.body)
    })

    it('should include credentials in fetch options', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ body: {} }), // Minimal valid body
      })
      await PixivApiService.fetchArtworkMetadata(artworkId)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ credentials: 'include' }),
      )
    })

    it('should throw PixivApiError for API error (404)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      await expect(
        PixivApiService.fetchArtworkMetadata(artworkId),
      ).rejects.toThrowError(PixivApiError)
      try {
        await PixivApiService.fetchArtworkMetadata(artworkId)
      } catch (error) {
        expect(error).toBeInstanceOf(PixivApiError)
        const e = error as PixivApiError
        expect(e.message).toBe(
          'Failed to fetch artwork metadata: 404 (Not Found)',
        )
        expect(e.status).toBe(404)
        expect(e.url).toBe(expectedUrl)
      }
    })

    it('should throw PixivApiError for API error (500)', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(
        PixivApiService.fetchArtworkMetadata(artworkId),
      ).rejects.toThrowError(PixivApiError)
      try {
        await PixivApiService.fetchArtworkMetadata(artworkId)
      } catch (error) {
        expect(error).toBeInstanceOf(PixivApiError)
        const e = error as PixivApiError
        expect(e.message).toBe(
          'Failed to fetch artwork metadata: 500 (Internal Server Error)',
        )
        expect(e.status).toBe(500)
        expect(e.url).toBe(expectedUrl)
      }
    })

    it('should throw PixivApiError for invalid response format (missing body)', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}), // Missing 'body'
      })

      await expect(
        PixivApiService.fetchArtworkMetadata(artworkId),
      ).rejects.toThrowError(PixivApiError)
      try {
        await PixivApiService.fetchArtworkMetadata(artworkId)
      } catch (error) {
        expect(error).toBeInstanceOf(PixivApiError)
        const e = error as PixivApiError
        expect(e.message).toBe('Invalid response format: missing body')
        expect(e.status).toBeUndefined()
        expect(e.url).toBe(expectedUrl)
      }
    })

    it('should throw PixivApiError for network error', async () => {
      const networkErrorMessage = 'Network request failed'
      mockFetch.mockRejectedValue(new Error(networkErrorMessage))

      await expect(
        PixivApiService.fetchArtworkMetadata(artworkId),
      ).rejects.toThrowError(PixivApiError)
      try {
        await PixivApiService.fetchArtworkMetadata(artworkId)
      } catch (error) {
        expect(error).toBeInstanceOf(PixivApiError)
        const e = error as PixivApiError
        expect(e.message).toBe(
          `Network error while fetching artwork metadata: ${networkErrorMessage}`,
        )
        expect(e.status).toBeUndefined()
        expect(e.url).toBe(expectedUrl)
      }
    })

    it('should throw PixivApiError for non-Error object thrown by fetch', async () => {
      const nonErrorObject = 'Fetch failed unexpectedly'
      mockFetch.mockRejectedValue(nonErrorObject)

      await expect(
        PixivApiService.fetchArtworkMetadata(artworkId),
      ).rejects.toThrowError(PixivApiError)
      try {
        await PixivApiService.fetchArtworkMetadata(artworkId)
      } catch (error) {
        expect(error).toBeInstanceOf(PixivApiError)
        const e = error as PixivApiError
        expect(e.message).toBe(
          `Network error while fetching artwork metadata: Unknown error`,
        )
        expect(e.status).toBeUndefined()
        expect(e.url).toBe(expectedUrl)
      }
    })
  })
})
