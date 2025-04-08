# Pixiv Downloader

一個 Chrome 擴充功能，方便下載 Pixiv 插畫，支援自訂檔名、尺寸選擇與衝突處理。

## 功能特色

- 一鍵下載 Pixiv 插畫
- 自訂檔案名稱模板（支援作者、標題、ID 等資訊）
- 多種圖片尺寸選擇
- 檔名衝突處理（唯一化、覆蓋、提示）
- 設定頁面採用 Vue 3 + Vuetify
- 支援 [代理](https://pixiv.cat/) 避免防盜鏈

## 安裝與使用

1. **安裝**
   - 前往 [releases 頁面](https://github.com/david20571015/pixiv-downloader/releases) 下載最新版 `pixiv-downloader-{version}-chrome.zip`
   - 解壓縮 zip 檔
   - 在 Chrome 擴充功能頁開啟「開發人員模式」
   - 點擊「載入未封裝項目」，選擇解壓縮後的 `pixiv-downloader-{version}-chrome` 資料夾

2. **下載圖片**
   - 進入 Pixiv 插畫頁面
   - 點擊插畫下方的「Download」按鈕
   - 圖片將下載到預設的下載資料夾

3. **設定選項**
   - 在擴充功能管理頁點擊「選項」

## 開發指南

### 環境需求

- Node.js 20+
- npm

### 安裝依賴

```bash
npm ci
npm run postinstall
```

### 啟動開發伺服器

```bash
npm run dev
```

### 打包

```bash
npm run build
```

### 格式化與檢查

- 格式化：`npm run format`
- Lint 修正：`npm run lint`
- Type 檢查：`npm run check:compile`

## 授權

本專案採用 [MIT License](LICENSE) 授權。
