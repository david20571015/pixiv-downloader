import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OptionStore, defaultOptions, type Options } from './options-store'
import { fakeBrowser } from 'wxt/testing'

describe('OptionStore', () => {
  beforeEach(() => {
    fakeBrowser.reset()
    // Mock chrome.storage.local.get and set as fakeBrowser might not provide spies
    // However, fakeBrowser.storage.local should reflect changes directly.
    // We will use fakeBrowser.storage.local.get() for verification.
    vi.spyOn(console, 'error').mockImplementation(() => {}) // Suppress console.error
  })

  describe('getOptions', () => {
    it('should return defaultOptions when no options are set', async () => {
      const options = await OptionStore.getOptions()
      expect(options).toEqual(defaultOptions)
    })

    it('should return previously set options', async () => {
      const customOptions: Options = {
        filenameTemplate: 'custom_template',
        conflictAction: 'overwrite',
        imageSize: 'small',
      }
      await fakeBrowser.storage.local.set(customOptions)
      const options = await OptionStore.getOptions()
      expect(options).toEqual(customOptions)
    })

    it('should merge saved options with default options', async () => {
      const partialOptions: Partial<Options> = {
        filenameTemplate: 'partial_template',
      }
      // fakeBrowser.storage.local.get in OptionStore.getOptions will use defaultOptions for missing keys
      await fakeBrowser.storage.local.set(partialOptions)
      const options = await OptionStore.getOptions()
      expect(options).toEqual({
        ...defaultOptions,
        ...partialOptions,
      })
    })

    it('should re-throw and log error when chrome.storage.local.get fails', async () => {
      const expectedError = new Error('Failed to get options')
      const getSpy = vi
        .spyOn(fakeBrowser.storage.local, 'get')
        .mockRejectedValue(expectedError)

      await expect(OptionStore.getOptions()).rejects.toThrow(expectedError)
      expect(console.error).toHaveBeenCalledWith(
        'Error retrieving options:',
        expectedError,
      )
      getSpy.mockRestore()
    })
  })

  describe('setOptions', () => {
    it('should correctly save a full set of options', async () => {
      const newOptions: Options = {
        filenameTemplate: 'full_set_template',
        conflictAction: 'prompt',
        imageSize: 'medium',
      }
      await OptionStore.setOptions(newOptions)
      const storedOptions = await fakeBrowser.storage.local.get(null) // Get all keys
      expect(storedOptions).toEqual(newOptions)
    })

    it('should correctly save a partial set of options', async () => {
      const partialOptions: Partial<Options> = {
        conflictAction: 'overwrite',
      }
      await OptionStore.setOptions(partialOptions)
      // We expect only the partial options to be set, not merged with defaults during set.
      // The merging happens in getOptions.
      const storedOptions = await fakeBrowser.storage.local.get(null)
      expect(storedOptions).toEqual(partialOptions)
    })

    it('should re-throw and log error when chrome.storage.local.set fails', async () => {
      const expectedError = new Error('Failed to set options')
      const setSpy = vi
        .spyOn(fakeBrowser.storage.local, 'set')
        .mockRejectedValue(expectedError)

      const optionsToSet: Partial<Options> = { filenameTemplate: 'test' }
      await expect(OptionStore.setOptions(optionsToSet)).rejects.toThrow(
        expectedError,
      )
      expect(console.error).toHaveBeenCalledWith(
        'Error saving options:',
        expectedError,
      )
      setSpy.mockRestore()
    })
  })

  describe('resetOptions', () => {
    it('should set options in storage back to defaultOptions', async () => {
      // First, set some custom options
      const customOptions: Options = {
        filenameTemplate: 'custom_template',
        conflictAction: 'overwrite',
        imageSize: 'small',
      }
      await OptionStore.setOptions(customOptions)
      let stored = await fakeBrowser.storage.local.get(null)
      expect(stored).toEqual(customOptions) // Verify custom options were set

      // Now reset
      await OptionStore.resetOptions()
      stored = await fakeBrowser.storage.local.get(null)
      expect(stored).toEqual(defaultOptions)
    })

    it('should call setOptions with defaultOptions (implementation detail, better to test outcome)', async () => {
      const setOptionsSpy = vi.spyOn(OptionStore, 'setOptions')
      await OptionStore.resetOptions()
      expect(setOptionsSpy).toHaveBeenCalledWith(defaultOptions)
      setOptionsSpy.mockRestore() // Clean up spy
    })
  })
})
