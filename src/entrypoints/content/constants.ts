/**
 * Content script related constants
 */

/**
 * Pixiv related constants
 */
export const PIXIV_CONFIG = {
  PROXY_HOSTNAME: 'i.pixiv.cat',
  API_BASE_URL: 'https://www.pixiv.net/ajax/illust',
  ARTWORKS_PATTERN: 'https://www.pixiv.net/artworks/*',
  SITE_PATTERN: 'https://www.pixiv.net/*',
} as const

/**
 * UI related constants
 */
export const UI_CONFIG = {
  DOWNLOAD_BUTTON_ID: 'download-button',
  TARGET_SELECTOR: 'main section div:first-child section',
  ERROR_TIMEOUT: 2500,
} as const
