import { PIXIV_CONFIG } from '@/entrypoints/content/constants'
import type { ArtworkMetadata } from '@/services/pixiv-api'
import { defineProxyService } from '@webext-core/proxy-service'

/**
 * Utility type to extract string keys from an object type
 */
type KeysMatching<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: P
}

/**
 * Valid template keys for artwork filename generation
 */
export type ArtworkTemplateKeys = KeysMatching<ArtworkMetadata, string>

/**
 * Interface for filename sanitization
 */
interface FilenameSanitizer {
  sanitize(str: string): string
}

/**
 * Default implementation of filename sanitization
 * Removes or replaces characters invalid in filenames
 */
export class DefaultFilenameSanitizer implements FilenameSanitizer {
  private readonly INVALID_CHARS = /[\\/:*?"<>|]/g
  private readonly REPLACEMENT = '_'

  sanitize(str: string): string {
    return str.replace(this.INVALID_CHARS, this.REPLACEMENT).trim()
  }
}

/**
 * Service for building filenames from templates
 * Follows Single Responsibility Principle
 */
export class FilenameBuilder {
  constructor(private readonly sanitizer: FilenameSanitizer) {}

  /**
   * Builds a filename from a template and metadata
   * @param filePathTemplate - Template string with placeholders like ${userName}
   * @param metadata - Artwork metadata to fill template
   * @returns Sanitized filename built from template
   */
  build(filePathTemplate: string, metadata: ArtworkMetadata): string {
    const replacements: Record<ArtworkTemplateKeys, string> = {
      userName: this.sanitizer.sanitize(metadata.userName),
      userId: metadata.userId,
      userAccount: this.sanitizer.sanitize(metadata.userAccount),
      title: this.sanitizer.sanitize(metadata.title),
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
}

/**
 * Interface for URL transformation
 */
interface UrlTransformer {
  transform(url: string): string
}

/**
 * Transforms Pixiv URLs to use proxy hostname
 */
class PixivProxyUrlTransformer implements UrlTransformer {
  constructor(private readonly proxyHostname: string) {}

  transform(url: string): string {
    const parsedUrl = new URL(url)
    parsedUrl.hostname = this.proxyHostname
    return parsedUrl.href
  }
}

/**
 * Service for downloading artworks
 * Follows Interface Segregation Principle
 */
export interface ArtworkDownloader {
  downloadArtwork(
    filename: string,
    url: string,
    conflictAction?: chrome.downloads.FilenameConflictAction,
  ): Promise<number>
}

/**
 * Creates artwork downloader implementation
 */
function createArtworkDownloader(): ArtworkDownloader {
  const urlTransformer = new PixivProxyUrlTransformer(
    PIXIV_CONFIG.PROXY_HOSTNAME,
  )

  return {
    async downloadArtwork(
      filename: string,
      url: string,
      conflictAction: chrome.downloads.FilenameConflictAction = 'uniquify',
    ): Promise<number> {
      const parsedUrl = new URL(url)
      const ext = parsedUrl.pathname.split('.').pop() ?? 'png'
      const transformedUrl = urlTransformer.transform(url)

      return await chrome.downloads.download({
        url: transformedUrl,
        filename: `${filename}.${ext}`,
        conflictAction,
      })
    },
  }
}

export const [registerArtworkDownloader, getArtworkDownloader] =
  defineProxyService('ArtworkDownloader', createArtworkDownloader)
