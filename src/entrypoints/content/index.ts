import { createApp } from 'vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VSnackbar } from 'vuetify/components/VSnackbar'

import { ContentScriptContext } from '#imports'
import { PIXIV_CONFIG, UI_CONFIG } from './constants'

import DownloadButton from './DownloadButton.vue'

const artworksPattern = new MatchPattern(PIXIV_CONFIG.ARTWORKS_PATTERN)

/**
 * Content script entry point
 * Injects download button into Pixiv artwork pages
 */
export default defineContentScript({
  matches: [PIXIV_CONFIG.SITE_PATTERN],
  main(ctx: ContentScriptContext): void {
    // Check if we're already on an artwork page on initial load
    if (artworksPattern.includes(window.location.href)) {
      mountDownloadButton(ctx)
    }

    // Listen for navigation changes within the same tab
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      if (artworksPattern.includes(newUrl)) {
        mountDownloadButton(ctx)
      }
    })
  },
})

/**
 * Mounts the download button component into the page
 * Ensures only one instance exists at a time
 * @param ctx - Content script context for UI integration
 */
function mountDownloadButton(ctx: ContentScriptContext): void {
  const existing = document.getElementById(UI_CONFIG.DOWNLOAD_BUTTON_ID)
  if (existing) return

  const container = document.createElement('div')
  container.id = UI_CONFIG.DOWNLOAD_BUTTON_ID

  const vuetify = createVuetify({
    components: {
      VSnackbar,
    },
  })
  const app = createApp(DownloadButton).use(vuetify)

  const ui = createIntegratedUi(ctx, {
    position: 'inline',
    anchor: UI_CONFIG.TARGET_SELECTOR,
    onMount: (mountPoint: HTMLElement) => {
      mountPoint.replaceWith(container)
      app.mount(`#${UI_CONFIG.DOWNLOAD_BUTTON_ID}`)
    },
  })

  ui.autoMount({ once: true })
}
