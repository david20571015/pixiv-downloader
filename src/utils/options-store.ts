import type { ArtworkUrls } from './downloader'

export interface Options {
  filenameTemplate: string
  conflictAction: chrome.downloads.FilenameConflictAction
  imageSize: keyof ArtworkUrls
}

export const defaultOptions: Options = {
  filenameTemplate: 'PxDownloader/${userName}(${userId})/${title}(${id})',
  conflictAction: 'uniquify',
  imageSize: 'original',
}

export const OptionStore = {
  async getOptions(): Promise<Options> {
    try {
      return (await chrome.storage.local.get(defaultOptions)) as Options
    } catch (error) {
      console.error('Error retrieving options:', error)
      throw error
    }
  },

  async setOptions(options: Partial<Options>) {
    try {
      await chrome.storage.local.set(options)
    } catch (error) {
      console.error('Error saving options:', error)
      throw error
    }
  },

  async resetOptions() {
    await this.setOptions(defaultOptions)
  },
}
