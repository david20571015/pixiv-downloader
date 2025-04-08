<script setup lang="ts">
import { onMounted, reactive, toRaw } from 'vue'
import { OptionStore, type Options } from '@/utils/options-store'
import { filePathPlaceholderDefinitions, conflictActions } from './constant'

const currentOptions = reactive({}) as Options

async function loadOptions() {
  Object.assign(currentOptions, await OptionStore.getOptions())
}

onMounted(loadOptions)

async function saveOptions() {
  await OptionStore.setOptions(toRaw(currentOptions))
}

async function resetOptions() {
  await OptionStore.resetOptions()
  await loadOptions()
}
</script>

<template>
  <v-container class="d-flex flex-column">
    <v-text-field
      v-model="currentOptions.filenameTemplate"
      label="File name template (You don't have the inculde the file extension)"
    />
    <h3>For the file name template, you can use the following placeholders:</h3>
    <v-data-table
      hide-default-footer
      disable-sort
      :items="filePathPlaceholderDefinitions"
    />

    <v-select
      v-model="currentOptions.conflictAction"
      label="Filename conflict action"
      :items="conflictActions"
    />

    <v-container class="d-flex flex-row-reverse ga-2">
      <v-btn color="primary" @click="saveOptions">Save</v-btn>
      <v-btn color="secondary" @click="resetOptions">Reset</v-btn>
    </v-container>
  </v-container>
</template>
