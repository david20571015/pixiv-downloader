<script setup lang="ts">
import { onMounted, reactive, toRaw, ref } from 'vue'
import { OptionStore, type Options } from '@/utils/options-store'
import { DOWNLOAD_CONFIG, OPTIONS_UI_CONFIG } from './constant'

const currentOptions = reactive({}) as Options
const showSaveSuccess = ref(false)
const showSaveError = ref(false)
const showResetSuccess = ref(false)
const showResetError = ref(false)

/**
 * Loads current options from storage into the reactive state
 */
async function loadOptions(): Promise<void> {
  Object.assign(currentOptions, await OptionStore.getOptions())
}

onMounted(loadOptions)

/**
 * Saves current options to storage
 * Shows success or error notification based on result
 */
async function saveOptions(): Promise<void> {
  try {
    await OptionStore.setOptions(toRaw(currentOptions))
    showSaveSuccess.value = true
  } catch (error) {
    console.error('Failed to save options:', error)
    showSaveError.value = true
  }
}

/**
 * Resets options to default values
 * Reloads the form with default values
 * Shows success or error notification based on result
 */
async function resetOptions(): Promise<void> {
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
      :items="DOWNLOAD_CONFIG.PLACEHOLDERS"
    />

    <v-select
      v-model="currentOptions.conflictAction"
      label="Filename conflict action"
      :items="DOWNLOAD_CONFIG.CONFLICT_ACTIONS"
    />

    <v-container class="d-flex flex-row-reverse ga-2">
      <v-btn color="primary" @click="saveOptions">Save</v-btn>
      <v-btn color="secondary" @click="resetOptions">Reset</v-btn>
    </v-container>

    <!-- Success Messages -->
    <v-snackbar
      v-model="showSaveSuccess"
      color="success"
      :timeout="OPTIONS_UI_CONFIG.SNACKBAR_TIMEOUT_MS"
    >
      Settings saved successfully!
    </v-snackbar>
    <v-snackbar
      v-model="showResetSuccess"
      color="success"
      :timeout="OPTIONS_UI_CONFIG.SNACKBAR_TIMEOUT_MS"
    >
      Settings reset to default successfully!
    </v-snackbar>

    <!-- Error Messages -->
    <v-snackbar
      v-model="showSaveError"
      color="error"
      :timeout="OPTIONS_UI_CONFIG.SNACKBAR_TIMEOUT_MS"
    >
      Failed to save settings. Please try again.
    </v-snackbar>
    <v-snackbar
      v-model="showResetError"
      color="error"
      :timeout="OPTIONS_UI_CONFIG.SNACKBAR_TIMEOUT_MS"
    >
      Failed to reset settings. Please try again.
    </v-snackbar>
  </v-container>
</template>
