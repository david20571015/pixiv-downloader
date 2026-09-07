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

const artworkId = document.location.pathname.split('/').pop()!

onMounted(() => {
  // Prefetch metadata into cache on mount for fast download response
  artworkDownloader.prefetch(artworkId).catch((error) => {
    console.warn('Failed to prefetch artwork metadata:', error)
  })
})

async function downloadFile() {
  if (!isDownloadable.value) return

  downloadState.value = DownloadState.DOWNLOADING

  try {
    await artworkDownloader.download(artworkId)
    downloadState.value = DownloadState.DOWNLOADED
  } catch (error) {
    console.error('Download failed:', error)
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
    Failed to download artwork. Please try again later.
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
