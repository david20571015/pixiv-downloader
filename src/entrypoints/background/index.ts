import { registerArtworkDownloader } from '@/utils/downloader'

export const PIXIV_REFERER_RULE_ID = 1

export async function setupDeclarativeNetRequest(): Promise<void> {
  const rule: chrome.declarativeNetRequest.Rule = {
    id: PIXIV_REFERER_RULE_ID,
    priority: 1,
    action: {
      type: 'modifyHeaders',
      requestHeaders: [
        {
          header: 'Referer',
          operation: 'set',
          value: 'https://www.pixiv.net/',
        },
      ],
    },
    condition: {
      urlFilter: '||pximg.net',
      resourceTypes: ['xmlhttprequest', 'image', 'other'],
    },
  }

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [PIXIV_REFERER_RULE_ID],
    addRules: [rule],
  })
}

export default defineBackground({
  type: 'module',

  main() {
    setupDeclarativeNetRequest().catch((error) => {
      console.error('Failed to setup declarativeNetRequest rules:', error)
    })
    registerArtworkDownloader()
  },
})
