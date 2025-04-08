# Pixiv Downloader

A Chrome extension to easily download illustrations from Pixiv, supporting customizable filenames, image size selection, and conflict handling.

## Features

- One-click Pixiv illustration download
- Customizable filename templates (author, title, ID, etc.)
- Multiple image size options
- Filename conflict handling (uniquify, overwrite, prompt)
- Options page built with Vue 3 + Vuetify
- [Proxy](https://pixiv.cat/) support to bypass hotlink protection

## Installation & Usage

1. **Install**
   - Download the latest `pixiv-downloader-{version}-chrome.zip`
 from the [releases page](https://github.com/david20571015/pixiv-downloader/releases)
   - Unzip the downloaded file
   - Open Chrome Extensions page and enable Developer Mode
   - Click "Load unpacked" and select the unzipped `pixiv-downloader-{version}-chrome` folder

2. **Download images**
   - Visit a Pixiv illustration page
   - Click the "Download" button under the illustration
   - The image will be downloaded to your default download directory

3. **Configure options**
   - Click "Options" in the extension management page

## Development

### Requirements

- Node.js 20+
- npm

### Install dependencies

```bash
npm ci
npm run postinstall
```

### Start development server

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Formatting & Checks

- Format code: `npm run format`
- Fix lint issues: `npm run lint`
- Type check: `npm run check:compile`

## License

This project is licensed under the [MIT License](LICENSE).
