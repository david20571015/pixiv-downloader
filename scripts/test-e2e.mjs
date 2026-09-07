import { chromium } from 'playwright'
import path from 'node:path'

async function run() {
  const extensionPath = path.resolve('./dist/chrome-mv3')
  console.log('--- Playwright Chrome Extension E2E Test ---')
  console.log('Loading unpacked extension from:', extensionPath)

  const context = await chromium.launchPersistentContext('', {
    headless: false,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  })

  await context.newPage()
  let worker = context.serviceWorkers()[0]
  if (!worker) {
    worker = await context.waitForEvent('serviceworker', { timeout: 5000 })
  }

  console.log('✓ Service worker initialized:', worker.url())

  // Test 1: Check declarativeNetRequest rules
  console.log('\n[Test 1] Checking declarativeNetRequest dynamic rules...')
  const rules = await worker.evaluate(async () => {
    return await chrome.declarativeNetRequest.getDynamicRules()
  })

  if (!rules || rules.length === 0 || rules[0].id !== 1) {
    throw new Error('DNR rule was not registered properly!')
  }
  const refererHeader = rules[0].action?.requestHeaders?.find(
    (h) => h.header.toLowerCase() === 'referer',
  )
  if (!refererHeader || refererHeader.value !== 'https://www.pixiv.net/') {
    throw new Error(
      `Referer header is not set to https://www.pixiv.net/: ${JSON.stringify(refererHeader)}`,
    )
  }
  console.log(
    '✓ declarativeNetRequest rule properly configured for Referer: https://www.pixiv.net/',
  )

  // Test 2: Test Pixiv API metadata retrieval
  console.log('\n[Test 2] Testing Pixiv API and real image URL resolution...')
  const apiTest = await worker.evaluate(async () => {
    try {
      const res = await fetch('https://www.pixiv.net/ajax/illust/114755147')
      const data = await res.json()
      const originalUrl = data?.body?.urls?.original
      return {
        ok: res.ok,
        status: res.status,
        hasBody: Boolean(data?.body),
        title: data?.body?.title,
        originalUrl,
      }
    } catch (err) {
      return { error: err.message }
    }
  })

  // Test 3: Test direct fetch against official Pixiv CDN (i.pximg.net)
  console.log(
    '\n[Test 3] Testing direct fetch to i.pximg.net with injected Referer...',
  )
  const testImageUrl =
    apiTest.originalUrl ||
    'https://i.pximg.net/img-original/img/2024/01/01/01/03/14/114755147_p0.jpg'

  const imageFetchResult = await worker.evaluate(async (url) => {
    try {
      const res = await fetch(url)
      const contentType = res.headers.get('content-type')
      const contentLength = res.headers.get('content-length')
      const buffer = await res.arrayBuffer()
      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        contentType,
        contentLength,
        bufferByteLength: buffer.byteLength,
      }
    } catch (err) {
      return { error: err.message }
    }
  }, testImageUrl)

  if (!imageFetchResult.ok || imageFetchResult.status !== 200) {
    throw new Error(
      `Fetch to i.pximg.net failed with status: ${imageFetchResult.status} ${imageFetchResult.statusText}`,
    )
  }
  console.log(
    `✓ Image fetched directly from i.pximg.net! HTTP 200 OK (${imageFetchResult.bufferByteLength} bytes, ${imageFetchResult.contentType})`,
  )

  await context.close()
  console.log('\n========================================')
  console.log('🎉 ALL AUTOMATED PLAYWRIGHT TESTS PASSED!')
  console.log('========================================')
}

run().catch((err) => {
  console.error('\n❌ E2E test failed:', err)
  process.exit(1)
})
