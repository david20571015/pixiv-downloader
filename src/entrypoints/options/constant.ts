import type { ArtworkTemplateKeys } from '@/utils/downloader'
import type { Options } from '@/utils/options-store'

interface PlaceholderDefinition {
  placeholder: `\${${ArtworkTemplateKeys}}`
  description: string
}

export const filePathPlaceholderDefinitions: PlaceholderDefinition[] = [
  { placeholder: '${userName}', description: 'User nickname' },
  { placeholder: '${userId}', description: 'User ID' },
  { placeholder: '${userAccount}', description: 'User account' },
  { placeholder: '${title}', description: 'Artwork title' },
  { placeholder: '${id}', description: 'Artwork ID' },
] as const

export const conflictActions: Options['conflictAction'][] = [
  'uniquify',
  'overwrite',
  'prompt',
] as const

export const snackbarTimeout = 2500 as const // 2.5 seconds
