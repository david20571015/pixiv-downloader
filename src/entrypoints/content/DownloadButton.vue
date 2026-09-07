<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import { artworkDownloader } from '@/utils/downloader'
import { UI_CONFIG } from './constants'

enum DownloadState {
  UNDOWNLOADED = 'Download',
  DOWNLOADING = 'Downloading...',
  DOWNLOADED = 'Downloaded',
}

const downloadState = ref(DownloadState.UNDOWNLOADED)
const isDownloadable = computed(
  () => downloadState.value === DownloadState.UNDOWNLOADED,
)
const showDownloadError = ref(false)
const errorMessage = ref('')

function getArtworkId(): string {
  const match = window.location.pathname.match(/artworks\/(\d+)/)
  if (match?.[1]) return match[1]
  const segments = window.location.pathname.split('/').filter(Boolean)
  return segments.pop() ?? ''
}

const artworkId = getArtworkId()

onMounted(() => {
  if (!artworkId) return
  // Prefetch metadata into cache on mount for fast download response
  artworkDownloader.prefetch(artworkId).catch((error) => {
    console.warn('Failed to prefetch artwork metadata:', error)
  })
})

async function downloadFile() {
  if (!isDownloadable.value || !artworkId) return

  downloadState.value = DownloadState.DOWNLOADING

  try {
    await artworkDownloader.download(artworkId)
    downloadState.value = DownloadState.DOWNLOADED
  } catch (error: unknown) {
    console.error('Download failed:', error)
    const errStr = error instanceof Error ? error.message : String(error)
    if (
      errStr.includes('message port closed') ||
      errStr.includes('context invalidated')
    ) {
      errorMessage.value =
        '擴充功能已重新載入或連線中斷，請重新整理（F5）網頁後重試'
    } else {
      errorMessage.value = 'Failed to download artwork. Please try again later.'
    }
    showDownloadError.value = true
    downloadState.value = DownloadState.UNDOWNLOADED
  }
}
</script>

<template>
  <button type="button" @click="downloadFile" :disabled="!isDownloadable">
    {{ downloadState }}
  </button>
  <v-snackbar
    v-model="showDownloadError"
    color="tonal"
    :timeout="UI_CONFIG.ERROR_TIMEOUT"
  >
    {{ errorMessage || 'Failed to download artwork. Please try again later.' }}
  </v-snackbar>
</template>

<style scoped>
button {
  display: inline-block;
  height: 32px;
  margin-right: 20px;
  line-height: 32px;
  font-weight: 700;
  cursor: pointer;
}
</style>
