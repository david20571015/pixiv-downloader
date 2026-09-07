import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import autoImport from './.wxt/eslint-auto-imports.mjs'

export default defineConfig([
  globalIgnores(['dist/**', '.output/**', '.wxt/**']),
  autoImport,
  {
    name: 'pixiv/globals',
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/essential'],
  {
    name: 'pixiv/vue-ts-parser',
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
])
