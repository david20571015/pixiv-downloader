<script setup lang="ts">
import { ref, computed } from 'vue'

import { PixivApiService } from '@/services/pixiv-api'
import {
  getArtworkDownloader,
  FilenameBuilder,
  DefaultFilenameSanitizer,
} from '@/utils/downloader'
import { OptionsService } from '@/utils/options-store'
import { UI_CONFIG } from './constants'

/**
 * Enum for download button states
 */
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

/**
 * Extract artwork ID from current URL
 */
const artworkId = document.location.pathname.split('/').pop()!

/**
 * Services initialization
 */
const pixivApiService = new PixivApiService()
const optionsService = new OptionsService()
const filenameBuilder = new FilenameBuilder(new DefaultFilenameSanitizer())

/**
 * Pre-fetch metadata to improve download performance
 */
const metadataPromise = pixivApiService.fetchArtworkMetadata(artworkId)
const artworkDownloader = getArtworkDownloader()

/**
 * Handles the download process for the current artwork
 * Coordinates metadata fetching, filename building, and download initiation
 */
async function downloadFile(): Promise<void> {
  if (!isDownloadable.value) return

  downloadState.value = DownloadState.DOWNLOADING

  try {
    const [artworkMetadata, options] = await Promise.all([
      metadataPromise,
      optionsService.getOptions(),
    ])
    const filename = filenameBuilder.build(
      options.filenameTemplate,
      artworkMetadata,
    )

    await artworkDownloader.downloadArtwork(
      filename,
      artworkMetadata.urls[options.imageSize],
      options.conflictAction,
    )

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
    :timeout="UI_CONFIG.ERROR_TIMEOUT_MS"
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
