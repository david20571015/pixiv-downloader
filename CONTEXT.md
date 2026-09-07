# Pixiv Downloader — 領域模型與架構名詞 (Domain Model & Vocabulary)

本文件定義專案的核心領域概念與架構接縫（Seams）。所有模組設計與介面皆以此詞彙為基準。

## 1. 核心實體與領域概念 (Core Entities & Concepts)

- **Artwork (作品)**：Pixiv 上的插畫或漫畫實體，由全域唯一的數字識別碼 `artworkId` 標識。
- **ArtworkMetadata (作品中繼資料)**：由 Pixiv API 回傳之作品資料結構，包含作品標題 (`title`)、作者 ID (`userId`)、作者暱稱 (`userName`)、作者帳號 (`userAccount`) 以及影像規格網址字典 (`urls`)。
- **ImageSize (影像規格)**：圖片下載尺寸等級，包含 `original`（原圖）、`regular`、`small`、`thumb`、`mini`。預設為 `original`。
- **FilenameTemplate (檔名路徑範本)**：使用者自訂之存檔格式字串，支援 `${userName}`、`${userId}`、`${userAccount}`、`${title}`、`${id}` 等佔位符。
- **SanitizedPath (消毒路徑)**：經處理後移除非法檔名字元（如 `\ / : * ? " < > |`）的實際儲存檔名路徑。
- **DownloadConflictAction (衝突策略)**：目標檔案已存在時之 Chrome 下載處理策略，包含 `uniquify`、`overwrite`、`prompt`。
- **ProxyHostname (鏡像代理主機)**：繞過 Pixiv 圖片防盜鏈防護的代理節點（如 `i.pixiv.cat`）。

## 2. 模組與架構接縫 (Modules & Seams)

- **ArtworkDownloader (作品下載深模組)**：
  - **定位**：核心深模組（Deep Module），駐留於 Content Script 端。
  - **介面 (Interface)**：
    - `prefetch(artworkId: string): Promise<ArtworkMetadata>`：預載並快取中繼資料。
    - `download(artworkId: string): Promise<DownloadResult>`：執行完整下載調度流程。
  - **接縫後方實作 (Behind the Seam)**：中繼資料請求快取、使用者偏好注入、路徑範本編譯消毒、代理網址轉換、呼叫背景下載 RPC。
- **RawFileDownloader (底層下載適配器)**：
  - **定位**：駐留於 Background Service Worker 的微小適配器（Adapter），透過 `@webext-core/proxy-service` 接收下載指令並直接驅動 `chrome.downloads.download`。
- **DownloadButton (下載視圖控制器)**：
  - **定位**：Vue 表現層元件，僅負責管理按鈕的 UI 狀態（Idle / Downloading / Downloaded / Error），不直接操作 Storage 或 Pixiv API。
