import { registerArtworkDownloader } from '@/utils/downloader'

/**
 * Background script entry point
 * Registers the artwork downloader service for use by content scripts
 */
export default defineBackground({
  type: 'module',

  main(): void {
    registerArtworkDownloader()
  },
})
