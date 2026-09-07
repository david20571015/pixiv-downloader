import { PIXIV_CONFIG } from '@/entrypoints/content/constants'
import { PixivApiService, type ArtworkMetadata } from '@/services/pixiv-api'
import { OptionStore, type Options } from '@/utils/options-store'
import {
  createProxyService,
  registerService,
  type ProxyService,
  type ProxyServiceKey,
} from '@webext-core/proxy-service'

type KeysMatching<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: P
}

export type ArtworkTemplateKeys = KeysMatching<ArtworkMetadata, string>

export function sanitizeFilename(str: string): string {
  return str.replace(/[\\/:*?"<>|]/g, '_').trim()
}

export function buildFilename(
  filePathTemplate: string,
  metadata: ArtworkMetadata,
): string {
  const replacements: Record<ArtworkTemplateKeys, string> = {
    userName: sanitizeFilename(metadata.userName),
    userId: metadata.userId,
    userAccount: sanitizeFilename(metadata.userAccount),
    title: sanitizeFilename(metadata.title),
    id: metadata.id,
  }

  const pattern = new RegExp(
    `\\$\\{(${Object.keys(replacements).join('|')})\\}`,
    'g',
  )

  return filePathTemplate.replace(
    pattern,
    (_, key: ArtworkTemplateKeys) => replacements[key] ?? '',
  )
}

/**
 * Raw file downloader background driver interface
 */
export interface RawFileDownloaderService {
  downloadFile(
    filename: string,
    url: string,
    conflictAction?: chrome.downloads.FilenameConflictAction,
  ): Promise<number>
}

function createRawFileDownloader(): RawFileDownloaderService {
  return {
    async downloadFile(
      filename: string,
      url: string,
      conflictAction: chrome.downloads.FilenameConflictAction = 'uniquify',
    ) {
      return await chrome.downloads.download({
        url,
        filename,
        conflictAction,
      })
    },
  }
}

export const RAW_DOWNLOADER_KEY =
  'RawFileDownloader' as ProxyServiceKey<RawFileDownloaderService>

export const registerRawFileDownloader = () =>
  registerService(RAW_DOWNLOADER_KEY, createRawFileDownloader())

let cachedRawDownloader: ProxyService<RawFileDownloaderService> | null = null
export const getRawFileDownloader = () =>
  (cachedRawDownloader ??= createProxyService(RAW_DOWNLOADER_KEY))

// Backward compatibility alias for background entrypoint
export const registerArtworkDownloader = registerRawFileDownloader

export interface DownloadResult {
  downloadId: number
  filename: string
}

export interface ArtworkDownloaderDependencies {
  fetchMetadata?: (artworkId: string) => Promise<ArtworkMetadata>
  getOptions?: () => Promise<Options>
  downloadFile?: (
    filename: string,
    url: string,
    conflictAction: chrome.downloads.FilenameConflictAction,
  ) => Promise<number>
}

/**
 * Deep module: ArtworkDownloader
 * Orchestrates metadata prefetching/caching, option injection,
 * filename compilation, proxy URL rewriting, and download dispatch.
 */
export class ArtworkDownloader {
  private readonly metadataCache = new Map<string, Promise<ArtworkMetadata>>()
  private readonly fetchMetadataFn: (id: string) => Promise<ArtworkMetadata>
  private readonly getOptionsFn: () => Promise<Options>
  private readonly downloadFileFn: (
    filename: string,
    url: string,
    conflictAction: chrome.downloads.FilenameConflictAction,
  ) => Promise<number>

  constructor(deps?: ArtworkDownloaderDependencies) {
    this.fetchMetadataFn =
      deps?.fetchMetadata ?? ((id) => PixivApiService.fetchArtworkMetadata(id))
    this.getOptionsFn = deps?.getOptions ?? (() => OptionStore.getOptions())
    this.downloadFileFn =
      deps?.downloadFile ??
      ((filename, url, conflictAction) =>
        getRawFileDownloader().downloadFile(filename, url, conflictAction))
  }

  /**
   * Prefetches and caches artwork metadata for quick subsequent downloads.
   */
  prefetch(artworkId: string): Promise<ArtworkMetadata> {
    const cached = this.metadataCache.get(artworkId)
    if (cached) return cached

    const promise = this.fetchMetadataFn(artworkId).catch((err) => {
      this.metadataCache.delete(artworkId)
      throw err
    })

    this.metadataCache.set(artworkId, promise)
    return promise
  }

  /**
   * Executes the complete artwork download pipeline.
   */
  async download(artworkId: string): Promise<DownloadResult> {
    const [metadata, options] = await Promise.all([
      this.prefetch(artworkId),
      this.getOptionsFn(),
    ])

    const baseFilename = buildFilename(options.filenameTemplate, metadata)
    const rawUrl = metadata.urls[options.imageSize] ?? metadata.urls.original

    const parsedUrl = new URL(rawUrl)
    const ext = parsedUrl.pathname.split('.').pop() ?? 'png'
    parsedUrl.hostname = PIXIV_CONFIG.PROXY_HOSTNAME
    const fullFilename = `${baseFilename}.${ext}`

    const downloadId = await this.downloadFileFn(
      fullFilename,
      parsedUrl.href,
      options.conflictAction,
    )

    return {
      downloadId,
      filename: fullFilename,
    }
  }
}

// Singleton instance for content scripts
export const artworkDownloader = new ArtworkDownloader()
