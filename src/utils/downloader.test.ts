import { describe, it, expect, vi } from 'vitest'
import {
  buildFilename,
  ArtworkDownloader,
  sanitizeFilename,
} from './downloader'
import type { ArtworkMetadata } from '@/services/pixiv-api'
import type { Options } from './options-store'

const mockMetadata: ArtworkMetadata = {
  id: '12345678',
  title: 'Test/Artwork:Special*Name?',
  userId: '98765',
  userName: 'Artist<Name>',
  userAccount: 'artist_account',
  urls: {
    mini: 'https://i.pximg.net/c/48x48/img-master/img/test_mini.jpg',
    thumb: 'https://i.pximg.net/c/250x250_80_a2/img-master/img/test_thumb.jpg',
    small: 'https://i.pximg.net/c/540x540_70/img-master/img/test_small.jpg',
    regular: 'https://i.pximg.net/img-master/img/test_regular.jpg',
    original: 'https://i.pximg.net/img-original/img/test_original.png',
  },
}

const mockOptions: Options = {
  filenameTemplate: 'Pixiv/${userName}(${userId})/${title}_${id}',
  conflictAction: 'uniquify',
  imageSize: 'original',
}

describe('sanitizeFilename', () => {
  it('replaces forbidden filesystem characters with underscore and trims', () => {
    expect(sanitizeFilename('  hello/world:test*bad?name"<>|  ')).toBe(
      'hello_world_test_bad_name____',
    )
  })
})

describe('buildFilename', () => {
  it('correctly substitutes all template placeholders and sanitizes dynamic values', () => {
    const filename = buildFilename(
      '${userName}/${userId}/${userAccount}/${title}/${id}',
      mockMetadata,
    )
    expect(filename).toBe(
      'Artist_Name_/98765/artist_account/Test_Artwork_Special_Name_/12345678',
    )
  })
})

describe('ArtworkDownloader', () => {
  it('caches prefetch promises to prevent duplicate network calls', async () => {
    const fetchMetadata = vi.fn().mockResolvedValue(mockMetadata)
    const downloader = new ArtworkDownloader({
      fetchMetadata,
      getOptions: vi.fn().mockResolvedValue(mockOptions),
      downloadFile: vi.fn().mockResolvedValue(1),
    })

    const p1 = downloader.prefetch('12345678')
    const p2 = downloader.prefetch('12345678')

    expect(fetchMetadata).toHaveBeenCalledTimes(1)
    const [res1, res2] = await Promise.all([p1, p2])
    expect(res1).toEqual(mockMetadata)
    expect(res2).toEqual(mockMetadata)
  })

  it('orchestrates metadata, options, template rendering, and proxy url for download', async () => {
    const fetchMetadata = vi.fn().mockResolvedValue(mockMetadata)
    const getOptions = vi.fn().mockResolvedValue(mockOptions)
    const downloadFile = vi.fn().mockResolvedValue(42)

    const downloader = new ArtworkDownloader({
      fetchMetadata,
      getOptions,
      downloadFile,
    })

    const result = await downloader.download('12345678')

    expect(fetchMetadata).toHaveBeenCalledWith('12345678')
    expect(getOptions).toHaveBeenCalledTimes(1)
    expect(downloadFile).toHaveBeenCalledWith(
      'Pixiv/Artist_Name_(98765)/Test_Artwork_Special_Name__12345678.png',
      'https://i.pixiv.cat/img-original/img/test_original.png',
      'uniquify',
    )
    expect(result).toEqual({
      downloadId: 42,
      filename:
        'Pixiv/Artist_Name_(98765)/Test_Artwork_Special_Name__12345678.png',
    })
  })

  it('reuses existing prefetch when download is triggered', async () => {
    const fetchMetadata = vi.fn().mockResolvedValue(mockMetadata)
    const downloadFile = vi.fn().mockResolvedValue(99)

    const downloader = new ArtworkDownloader({
      fetchMetadata,
      getOptions: vi.fn().mockResolvedValue(mockOptions),
      downloadFile,
    })

    // Pre-fetch first
    await downloader.prefetch('12345678')
    expect(fetchMetadata).toHaveBeenCalledTimes(1)

    // Download should not trigger another fetch
    await downloader.download('12345678')
    expect(fetchMetadata).toHaveBeenCalledTimes(1)
    expect(downloadFile).toHaveBeenCalledTimes(1)
  })

  it('supports selecting non-original image sizes based on options', async () => {
    const downloadFile = vi.fn().mockResolvedValue(101)
    const customOptions: Options = {
      ...mockOptions,
      imageSize: 'regular',
    }

    const downloader = new ArtworkDownloader({
      fetchMetadata: vi.fn().mockResolvedValue(mockMetadata),
      getOptions: vi.fn().mockResolvedValue(customOptions),
      downloadFile,
    })

    await downloader.download('12345678')

    expect(downloadFile).toHaveBeenCalledWith(
      expect.stringMatching(/\.jpg$/),
      'https://i.pixiv.cat/img-master/img/test_regular.jpg',
      'uniquify',
    )
  })

  it('evicts cache entry on fetch failure allowing subsequent retry', async () => {
    const fetchMetadata = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockMetadata)

    const downloader = new ArtworkDownloader({
      fetchMetadata,
      getOptions: vi.fn().mockResolvedValue(mockOptions),
      downloadFile: vi.fn().mockResolvedValue(1),
    })

    await expect(downloader.prefetch('12345678')).rejects.toThrow(
      'Network error',
    )
    expect(fetchMetadata).toHaveBeenCalledTimes(1)

    // Second call should retry and succeed
    const res = await downloader.prefetch('12345678')
    expect(fetchMetadata).toHaveBeenCalledTimes(2)
    expect(res).toEqual(mockMetadata)
  })
})
