import { defineConfig } from 'wxt'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  srcDir: 'src',
  outDir: 'dist',
  modules: ['@wxt-dev/module-vue', '@wxt-dev/auto-icons'],
  vite: () => ({
    plugins: [vuetify()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }),
  manifest: {
    permissions: ['downloads', 'storage'],
  },
})
