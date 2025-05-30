import type { ArtworkTemplateKeys } from '@/utils/downloader'
import type { Options } from '@/utils/options-store'

interface PlaceholderDefinition {
  placeholder: `\${${ArtworkTemplateKeys}}`
  description: string
}

/**
 * Download configuration including filename templates and conflict handling
 */
export const DOWNLOAD_CONFIG = {
  PLACEHOLDERS: [
    { placeholder: '${userName}', description: 'User nickname' },
    { placeholder: '${userId}', description: 'User ID' },
    { placeholder: '${userAccount}', description: 'User account' },
    { placeholder: '${title}', description: 'Artwork title' },
    { placeholder: '${id}', description: 'Artwork ID' },
  ] as PlaceholderDefinition[],
  CONFLICT_ACTIONS: [
    'uniquify',
    'overwrite',
    'prompt',
  ] as Options['conflictAction'][],
} as const

/**
 * UI related constants for options page
 */
export const OPTIONS_UI_CONFIG = {
  SNACKBAR_TIMEOUT: 2500,
} as const
