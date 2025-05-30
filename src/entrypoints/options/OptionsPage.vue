<script setup lang="ts">
import { onMounted, reactive, toRaw, ref } from 'vue'
import { OptionStore, type Options } from '@/utils/options-store'
import {
  filePathPlaceholderDefinitions,
  conflictActions,
  snackbarTimeout,
} from './constant'

const currentOptions = reactive({}) as Options
const showSaveSuccess = ref(false)
const showSaveError = ref(false)
const showResetSuccess = ref(false)
const showResetError = ref(false)

async function loadOptions() {
  Object.assign(currentOptions, await OptionStore.getOptions())
}

onMounted(loadOptions)

async function saveOptions() {
  try {
    await OptionStore.setOptions(toRaw(currentOptions))
    showSaveSuccess.value = true
  } catch (error) {
    console.error('Failed to save options:', error)
    showSaveError.value = true
  }
}

async function resetOptions() {
  try {
    await OptionStore.resetOptions()
    await loadOptions()
    showResetSuccess.value = true
  } catch (error) {
    console.error('Failed to reset options:', error)
    showResetError.value = true
  }
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

    <!-- Success Messages -->
    <v-snackbar
      v-model="showSaveSuccess"
      color="success"
      :timeout="snackbarTimeout"
    >
      Settings saved successfully!
    </v-snackbar>
    <v-snackbar
      v-model="showResetSuccess"
      color="success"
      :timeout="snackbarTimeout"
    >
      Settings reset to default successfully!
    </v-snackbar>

    <!-- Error Messages -->
    <v-snackbar
      v-model="showSaveError"
      color="error"
      :timeout="snackbarTimeout"
    >
      Failed to save settings. Please try again.
    </v-snackbar>
    <v-snackbar
      v-model="showResetError"
      color="error"
      :timeout="snackbarTimeout"
    >
      Failed to reset settings. Please try again.
    </v-snackbar>
  </v-container>
</template>
