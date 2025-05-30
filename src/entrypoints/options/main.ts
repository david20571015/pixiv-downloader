import { createApp } from 'vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import { VSnackbar } from 'vuetify/components/VSnackbar'

import OptionsPage from './OptionsPage.vue'

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

createApp(OptionsPage).use(vuetify).mount('#app')
