import type { ArtworkUrls } from '@/services/pixiv-api'

/**
 * Configuration options for the extension
 */
export interface Options {
  filenameTemplate: string
  conflictAction: chrome.downloads.FilenameConflictAction
  imageSize: keyof ArtworkUrls
}

/**
 * Default configuration values
 */
export const DEFAULT_OPTIONS: Readonly<Options> = {
  filenameTemplate: 'PxDownloader/${userName}(${userId})/${title}(${id})',
  conflictAction: 'uniquify',
  imageSize: 'original',
} as const

/**
 * Storage interface for managing extension options
 */
interface StorageAdapter {
  get(defaults: Options): Promise<Options>
  set(options: Partial<Options>): Promise<void>
}

/**
 * Chrome storage implementation
 */
class ChromeStorageAdapter implements StorageAdapter {
  async get(defaults: Options): Promise<Options> {
    return (await chrome.storage.local.get(defaults)) as Options
  }

  async set(options: Partial<Options>): Promise<void> {
    await chrome.storage.local.set(options)
  }
}

/**
 * Service for managing user options with dependency injection
 * Follows Single Responsibility Principle by focusing only on option management
 */
export class OptionsService {
  constructor(private readonly storage: StorageAdapter) {}

  /**
   * Retrieves current options from storage
   * @returns Promise resolving to current options
   * @throws Error if retrieval fails
   */
  async getOptions(): Promise<Options> {
    try {
      return await this.storage.get(DEFAULT_OPTIONS)
    } catch (error) {
      console.error('Error retrieving options:', error)
      throw new Error(
        `Failed to retrieve options: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Updates options in storage
   * @param options - Partial options to update
   * @throws Error if update fails
   */
  async setOptions(options: Partial<Options>): Promise<void> {
    try {
      await this.storage.set(options)
    } catch (error) {
      console.error('Error saving options:', error)
      throw new Error(
        `Failed to save options: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  /**
   * Resets options to default values
   * @throws Error if reset fails
   */
  async resetOptions(): Promise<void> {
    await this.setOptions(DEFAULT_OPTIONS)
  }
}

/**
 * Singleton instance for backward compatibility
 * @deprecated Use OptionsService class directly with dependency injection
 */
export const OptionStore = new OptionsService(new ChromeStorageAdapter())
