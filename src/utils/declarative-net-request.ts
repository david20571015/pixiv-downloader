/**
 * DeclarativeNetRequest rules management for Pixiv downloader
 */

export const PIXIV_REFERER_RULE_ID = 1

let setupPromise: Promise<void> | null = null

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
      responseHeaders: [
        {
          header: 'Access-Control-Allow-Origin',
          operation: 'set',
          value: '*',
        },
        {
          header: 'Access-Control-Allow-Methods',
          operation: 'set',
          value: 'GET, HEAD, OPTIONS',
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

export function ensureDeclarativeNetRequest(): Promise<void> {
  if (!setupPromise) {
    setupPromise = setupDeclarativeNetRequest().catch((err) => {
      setupPromise = null
      throw err
    })
  }
  return setupPromise
}
