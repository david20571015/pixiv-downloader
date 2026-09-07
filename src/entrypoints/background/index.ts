import { registerArtworkDownloader } from '@/utils/downloader'
import {
  setupDeclarativeNetRequest,
  PIXIV_REFERER_RULE_ID,
} from '@/utils/declarative-net-request'

export { PIXIV_REFERER_RULE_ID, setupDeclarativeNetRequest }

export default defineBackground({
  type: 'module',

  main() {
    setupDeclarativeNetRequest().catch((error) => {
      console.error('Failed to setup declarativeNetRequest rules:', error)
    })
    chrome.runtime.onInstalled?.addListener(() => {
      setupDeclarativeNetRequest().catch(console.error)
    })
    registerArtworkDownloader()
  },
})
