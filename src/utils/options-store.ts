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
 * Storage keys for options
 */
const STORAGE_KEYS = {
  FILENAME_TEMPLATE: 'local:filenameTemplate',
  CONFLICT_ACTION: 'local:conflictAction',
  IMAGE_SIZE: 'local:imageSize',
} as const

/**
 * Service for managing user options using WXT storage
 * Follows Single Responsibility Principle by focusing only on option management
 */
export class OptionsService {
  /**
   * Retrieves current options from storage
   * @returns Promise resolving to current options
   * @throws Error if retrieval fails
   */
  async getOptions(): Promise<Options> {
    try {
      const [filenameTemplate, conflictAction, imageSize] = await Promise.all([
        storage.getItem<string>(STORAGE_KEYS.FILENAME_TEMPLATE),
        storage.getItem<chrome.downloads.FilenameConflictAction>(
          STORAGE_KEYS.CONFLICT_ACTION,
        ),
        storage.getItem<keyof ArtworkUrls>(STORAGE_KEYS.IMAGE_SIZE),
      ])

      return {
        filenameTemplate: filenameTemplate ?? DEFAULT_OPTIONS.filenameTemplate,
        conflictAction: conflictAction ?? DEFAULT_OPTIONS.conflictAction,
        imageSize: imageSize ?? DEFAULT_OPTIONS.imageSize,
      }
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
      const updates: Promise<void>[] = []

      if (options.filenameTemplate !== undefined) {
        updates.push(
          storage.setItem(
            STORAGE_KEYS.FILENAME_TEMPLATE,
            options.filenameTemplate,
          ),
        )
      }
      if (options.conflictAction !== undefined) {
        updates.push(
          storage.setItem(STORAGE_KEYS.CONFLICT_ACTION, options.conflictAction),
        )
      }
      if (options.imageSize !== undefined) {
        updates.push(
          storage.setItem(STORAGE_KEYS.IMAGE_SIZE, options.imageSize),
        )
      }

      await Promise.all(updates)
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
