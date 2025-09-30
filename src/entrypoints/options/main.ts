import { createApp } from 'vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import { VSnackbar } from 'vuetify/components/VSnackbar'

import OptionsPage from './OptionsPage.vue'

/**
 * Configure Vuetify with custom defaults
 */
const vuetify = createVuetify({
  defaults: {
    VBtn: {
      variant: 'flat',
    },
  },
  components: {
    VBtn,
    VSnackbar,
  },
})

/**
 * Options page entry point
 * Initializes Vue application with Vuetify and mounts the options page
 */
createApp(OptionsPage).use(vuetify).mount('#app')
