<script setup lang="ts">
import { ref, computed } from 'vue'

import {
  getArtworkDownloader,
  sanitizeFilename,
  type ArtworkTemplateKeys,
  type ArtworkMetadata,
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
const prefetchdArtworkMetadata = fetchArtworkMetadata(artworkId)

async function downloadFile() {
  if (!isDownloadable.value) return

  downloadState.value = DownloadState.DOWNLOADING
  const artworkDownloader = getArtworkDownloader()

  try {
    const [artworkMetadata, options] = await Promise.all([
      prefetchdArtworkMetadata,
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

async function fetchArtworkMetadata(artworkId: string) {
  const url = `https://www.pixiv.net/ajax/illust/${artworkId}`
  const data = await fetch(url, { credentials: 'include' }).then((res) =>
    res.json(),
  )
  return data.body as ArtworkMetadata
}

function buildFilename(
  filePathTemplate: string,
  metadata: ArtworkMetadata,
): string {
  const replacements: Record<ArtworkTemplateKeys, string> = {
    userName: sanitizeFilename(metadata.userName),
    userId: metadata.userId,
    userAccount: sanitizeFilename(metadata.userAccount),
    title: sanitizeFilename(metadata.title),
    id: metadata.id,
  }

  const pattern = new RegExp(
    `\\$\\{(${Object.keys(replacements).join('|')})\\}`,
    'g',
  )

  return filePathTemplate.replace(
    pattern,
    (_, key: ArtworkTemplateKeys) => replacements[key] ?? '',
  )
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
