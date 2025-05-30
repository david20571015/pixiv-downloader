import { createApp } from 'vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VSnackbar } from 'vuetify/components/VSnackbar'

import { ContentScriptContext } from '#imports'

import DownloadButton from './DownloadButton.vue'

const artworksPattern = new MatchPattern('https://www.pixiv.net/artworks/*')

const downloadButtonId = 'download-button'
const targetSelector = 'main section div:first-child section'

export default defineContentScript({
  matches: ['https://www.pixiv.net/*'],
  main(ctx: ContentScriptContext) {
    ctx.addEventListener(window, 'wxt:locationchange', ({ newUrl }) => {
      if (artworksPattern.includes(newUrl)) {
        mountDownloadButton(ctx)
      }
    })
  },
})

function mountDownloadButton(ctx: ContentScriptContext): void {
  const existing = document.getElementById(downloadButtonId)
  if (existing) return

  const container = document.createElement('div')
  container.id = downloadButtonId
  container.style.marginRight = '20px'

  const vuetify = createVuetify({
    components: {
      VSnackbar,
    },
  })
  const app = createApp(DownloadButton).use(vuetify)

  const ui = createIntegratedUi(ctx, {
    position: 'inline',
    anchor: targetSelector,
    onMount: (mountPoint: HTMLElement) => {
      mountPoint.replaceWith(container)
      app.mount(`#${downloadButtonId}`)
    },
  })

  ui.autoMount({ once: true })
}
