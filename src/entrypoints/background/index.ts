import { registerArtworkDownloader } from '@/utils/downloader'

export default defineBackground({
  type: 'module',

  main() {
    registerArtworkDownloader()
  },
})
