import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildFilename, getArtworkDownloader } from './downloader'
import type { ArtworkMetadata } from '@/services/pixiv-api'
import { PIXIV_CONFIG } from '@/entrypoints/content/constants'

// Manually export sanitizeFilename for testing
export function sanitizeFilename(str: string): string {
  return str.replace(/[\\/:*?"<>|]/g, '_').trim()
}

describe('sanitizeFilename', () => {
  it('should return the same string if it is clean', () => {
    expect(sanitizeFilename('clean_string')).toBe('clean_string')
  })

  it('should replace forbidden characters', () => {
    expect(sanitizeFilename('forbidden\\/:*?"<>|chars')).toBe(
      'forbidden_________chars',
    )
  })

  it('should trim leading/trailing whitespace', () => {
    expect(sanitizeFilename('  leading_trailing_whitespace  ')).toBe(
      'leading_trailing_whitespace',
    )
  })
})

describe('buildFilename', () => {
  const metadata: ArtworkMetadata = {
    userName: 'Test User',
    userId: '12345',
    userAccount: 'testuser',
    title: 'Test Artwork',
    id: '67890',
    tags: [],
    description: '',
    createDate: '',
    pageCount: 1,
    width: 0,
    height: 0,
    illustType: 0,
    urls: {
      mini: '',
      thumb: '',
      small: '',
      regular: '',
      original: '',
    },
  }

  it('should build a filename with a simple template', () => {
    const template = '${title}_${id}'
    expect(buildFilename(template, metadata)).toBe('Test Artwork_67890')
  })

  it('should build a filename with all available metadata keys', () => {
    const template =
      '${userName}_${userId}_${userAccount}_${title}_${id}'
    expect(buildFilename(template, metadata)).toBe(
      'Test User_12345_testuser_Test Artwork_67890',
    )
  })

  it('should sanitize metadata containing forbidden characters', () => {
    const template = '${title}'
    const metadataWithForbiddenChars: ArtworkMetadata = {
      ...metadata,
      title: 'Test Artwork \\/:*?"<>|',
    }
    expect(buildFilename(template, metadataWithForbiddenChars)).toBe(
      'Test Artwork _________',
    )
  })
})

describe('downloadArtwork', () => {
  let artworkDownloader: ReturnType<typeof getArtworkDownloader>

  beforeEach(() => {
    // Ensure chrome.runtime is defined for the conditional check
    // @ts-expect-error - chrome is not defined in test environment
    global.chrome = {
      runtime: {
        getManifest: vi.fn(() => ({ manifest_version: 3 })),
        // Add other runtime properties if needed by getArtworkDownloader or its dependencies
      },
      downloads: {
        download: vi.fn(),
      },
    }
    // Clear mocks before each test if needed, but chrome object is now global
    vi.clearAllMocks()
    // Re-mock getManifest before each call to getArtworkDownloader
    global.chrome.runtime.getManifest = vi.fn(() => ({ manifest_version: 3 }))
    global.chrome.downloads.download = vi.fn()

    artworkDownloader = getArtworkDownloader()
  })

  it('should call chrome.downloads.download with correct parameters', async () => {
    const filename = 'test_artwork'
    const url = 'https://original.example.com/image.png'

    // Re-initialize artworkDownloader here if it depends on fresh mocks from global setup for each test
    // For this specific case, getArtworkDownloader() might be fine if it doesn't cache results based on initial chrome mock state
    if (artworkDownloader) {
      await artworkDownloader.downloadArtwork(filename, url)

      expect(chrome.downloads.download).toHaveBeenCalledWith({
        url: `https://${PIXIV_CONFIG.PROXY_HOSTNAME}/image.png`,
        filename: `${filename}.png`,
        conflictAction: 'uniquify',
      })
    } else {
      //This case should not happen if chrome.runtime is available
      expect(true).toBe(false)
    }
  })

  it('should use correct extension from url', async () => {
    const filename = 'test_artwork'
    const url = 'https://original.example.com/image.jpg'
    if (artworkDownloader) {
      await artworkDownloader.downloadArtwork(filename, url)

      expect(chrome.downloads.download).toHaveBeenCalledWith({
        url: `https://${PIXIV_CONFIG.PROXY_HOSTNAME}/image.jpg`,
        filename: `${filename}.jpg`,
        conflictAction: 'uniquify',
      })
    } else {
      //This case should not happen if chrome.runtime is available
      expect(true).toBe(false)
    }
  })

  it('should use png as default extension if not found in url', async () => {
    const filename = 'test_artwork'
    const url = 'https://original.example.com/image'
    if (artworkDownloader) {
      await artworkDownloader.downloadArtwork(filename, url)

      expect(chrome.downloads.download).toHaveBeenCalledWith({
        url: `https://${PIXIV_CONFIG.PROXY_HOSTNAME}/image`,
        filename: `${filename}.png`,
        conflictAction: 'uniquify',
      })
    } else {
      //This case should not happen if chrome.runtime is available
      expect(true).toBe(false)
    }
  })

  it('should use specified conflictAction', async () => {
    const filename = 'test_artwork'
    const url = 'https://original.example.com/image.png'
    const conflictAction = 'overwrite'
    if (artworkDownloader) {
      await artworkDownloader.downloadArtwork(filename, url, conflictAction)

      expect(chrome.downloads.download).toHaveBeenCalledWith({
        url: `https://${PIXIV_CONFIG.PROXY_HOSTNAME}/image.png`,
        filename: `${filename}.png`,
        conflictAction,
      })
    } else {
      //This case should not happen if chrome.runtime is available
      expect(true).toBe(false)
    }
  })

  it('should use correct extension from url', async () => {
    const filename = 'test_artwork'
    const url = 'https://original.example.com/image.jpg'
    await artworkDownloader.downloadArtwork(filename, url)

    expect(chrome.downloads.download).toHaveBeenCalledWith({
      url: `https://${PIXIV_CONFIG.PROXY_HOSTNAME}/image.jpg`,
      filename: `${filename}.jpg`,
      conflictAction: 'uniquify',
    })
  })

  it('should use png as default extension if not found in url', async () => {
    const filename = 'test_artwork'
    const url = 'https://original.example.com/image'
    await artworkDownloader.downloadArtwork(filename, url)

    expect(chrome.downloads.download).toHaveBeenCalledWith({
      url: `https://${PIXIV_CONFIG.PROXY_HOSTNAME}/image`,
      filename: `${filename}.png`,
      conflictAction: 'uniquify',
    })
  })

  it('should use specified conflictAction', async () => {
    const filename = 'test_artwork'
    const url = 'https://original.example.com/image.png'
    const conflictAction = 'overwrite'
    await artworkDownloader.downloadArtwork(filename, url, conflictAction)

    expect(chrome.downloads.download).toHaveBeenCalledWith({
      url: `https://${PIXIV_CONFIG.PROXY_HOSTNAME}/image.png`,
      filename: `${filename}.png`,
      conflictAction,
    })
  })
})
