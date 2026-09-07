import { PIXIV_CONFIG } from '@/entrypoints/content/constants'
import type { ArtworkMetadata } from '@/services/pixiv-api'
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

function sanitizeFilename(str: string): string {
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

function createArtworkDownloader() {
  return {
    async downloadArtwork(
      filename: string,
      url: string,
      conflictAction: chrome.downloads.FilenameConflictAction = 'uniquify',
    ) {
      const parsedUrl = new URL(url)
      const ext = parsedUrl.pathname.split('.').pop() ?? 'png'
      parsedUrl.hostname = PIXIV_CONFIG.PROXY_HOSTNAME

      return await chrome.downloads.download({
        url: parsedUrl.href,
        filename: `${filename}.${ext}`,
        conflictAction,
      })
    },
  }
}

export type ArtworkDownloader = ReturnType<typeof createArtworkDownloader>
export const ARTWORK_DOWNLOADER_KEY =
  'ArtworkDownloader' as ProxyServiceKey<ArtworkDownloader>

export const registerArtworkDownloader = () =>
  registerService(ARTWORK_DOWNLOADER_KEY, createArtworkDownloader())

let cachedArtworkDownloader: ProxyService<ArtworkDownloader> | null = null
export const getArtworkDownloader = () =>
  (cachedArtworkDownloader ??= createProxyService(ARTWORK_DOWNLOADER_KEY))
