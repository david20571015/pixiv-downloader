import { createApp } from 'vue'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'

import OptionsPage from './OptionsPage.vue'

const vuetify = createVuetify({
  defaults: {
    VBtn: {
      variant: 'flat',
    },
  },
})

createApp(OptionsPage).use(vuetify).mount('#app')
