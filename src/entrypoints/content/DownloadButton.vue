<script setup lang="ts">
import { ref, computed } from 'vue'

import {
  getArtworkDownloader,
  buildFilename,
  fetchArtworkMetadata,
} from '@/utils/downloader'
import { OptionStore } from '@/utils/options-store'

enum DownloadState {
  UNDOWNLOADED = 'Download',
  DOWNLOADING = 'Downloading...',
  DOWNLOADED = 'Downloaded',
}

const downloadState = ref(DownloadState.UNDOWNLOADED)
const isDownloadable = computed(
  () => downloadState.value === DownloadState.UNDOWNLOADED,
)

const artworkId = document.location.pathname.split('/').pop()!
const metadataPromise = fetchArtworkMetadata(artworkId)
const artworkDownloader = getArtworkDownloader()

async function downloadFile() {
  if (!isDownloadable.value) return

  downloadState.value = DownloadState.DOWNLOADING

  try {
    const [artworkMetadata, options] = await Promise.all([
      metadataPromise,
      OptionStore.getOptions(),
    ])
    const filename = buildFilename(options.filenameTemplate, artworkMetadata)

    await artworkDownloader.downloadArtwork(
      filename,
      artworkMetadata.urls[options.imageSize],
      options.conflictAction,
    )

    downloadState.value = DownloadState.DOWNLOADED
  } catch (error) {
    console.error('Download failed:', error)
    alert('Failed to download artwork. Please try again later.')
    downloadState.value = DownloadState.UNDOWNLOADED
  }
}
</script>

<template>
  <button type="button" @click="downloadFile" :disabled="!isDownloadable">
    {{ downloadState }}
  </button>
</template>

<style scoped>
button {
  display: inline-block;
  height: 32px;
  line-height: 32px;
  font-weight: 700;
  cursor: pointer;
}
</style>
