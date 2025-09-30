import type { ArtworkTemplateKeys } from '@/utils/downloader'
import type { Options } from '@/utils/options-store'

/**
 * Definition for template placeholder information
 */
interface PlaceholderDefinition {
  readonly placeholder: `\${${ArtworkTemplateKeys}}`
  readonly description: string
}

/**
 * Download configuration including filename templates and conflict handling
 * All values are readonly to ensure immutability
 */
export const DOWNLOAD_CONFIG = {
  PLACEHOLDERS: [
    { placeholder: '${userName}', description: 'User nickname' },
    { placeholder: '${userId}', description: 'User ID' },
    { placeholder: '${userAccount}', description: 'User account' },
    { placeholder: '${title}', description: 'Artwork title' },
    { placeholder: '${id}', description: 'Artwork ID' },
  ] as readonly PlaceholderDefinition[],
  CONFLICT_ACTIONS: [
    'uniquify',
    'overwrite',
    'prompt',
  ] as readonly Options['conflictAction'][],
} as const

/**
 * UI configuration for options page
 * All values are readonly to ensure immutability
 */
export const OPTIONS_UI_CONFIG = {
  SNACKBAR_TIMEOUT_MS: 2500,
} as const
