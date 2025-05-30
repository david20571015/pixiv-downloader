import { defineProxyService } from '@webext-core/proxy-service'

export interface ArtworkUrls {
  mini: string
  thumb: string
  small: string
  regular: string
  original: string
}

export interface ArtworkMetadata {
  title: string
  id: string
  userName: string
  userId: string
  userAccount: string
  urls: ArtworkUrls
}

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

function createArtworkDownloader() {
  const PIXIV_REVERSE_PROXY_HOSTNAME = 'i.pixiv.cat'

  return {
    async downloadArtwork(
      filename: string,
      url: string,
      conflictAction: chrome.downloads.FilenameConflictAction = 'uniquify',
    ) {
      const parsedUrl = new URL(url)
      const ext = parsedUrl.pathname.split('.').pop() ?? 'png'
      parsedUrl.hostname = PIXIV_REVERSE_PROXY_HOSTNAME

      return await chrome.downloads.download({
        url: parsedUrl.href,
        filename: `${filename}.${ext}`,
        conflictAction,
      })
    },
  }
}

export const [registerArtworkDownloader, getArtworkDownloader] =
  defineProxyService('ArtworkDownloader', createArtworkDownloader)
