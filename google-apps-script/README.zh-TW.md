# Google Apps Script 串接教學（繁體中文）

這份教學會讓你達成：

1. 客戶在前端按「Send to Cloud」
2. 檔案（圖片/影片）自動存到 Google Drive
3. 設定資料自動寫進 Google Sheet
4. 前端收到回傳連結（Drive 資料夾、Sheet）

---

## 1) 先準備 Google Sheet 與 Drive 資料夾

### A. 建立 Google Sheet（記錄提交資料）
- 先建立一個新的 Google Sheet
- 複製網址中的 Sheet ID  
  例如：
  `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`
  https://docs.google.com/spreadsheets/d/1sHCW-ehHvR0O0jfULQgZjqjsmqIyp-ZmzJgxwUwffYc/edit

### B. 建立 Google Drive 資料夾（存廣告素材）
- 建議另外建一個專用資料夾（例如 `Meta Ad Uploads`）
- 複製資料夾 ID  
  例如：
  `https://drive.google.com/drive/folders/<FOLDER_ID>`
  https://drive.google.com/drive/folders/1-oj_Lr5jqdnkmViB5q8I1pNFh9RX0Eku

---

## 2) 建立 Apps Script 專案

1. 開啟 [Google Apps Script](https://script.new/)
2. 把 `google-apps-script/Code.gs` 內容完整貼上
3. 在 `CONFIG` 填入：
   - `SHEET_ID`: 你的 Google Sheet ID（必填）
   - `DRIVE_FOLDER_ID`: 你的 Drive 資料夾 ID（可填，建議填）
   - `SHEET_NAME`: 可保留 `Submissions`

---

## 3) 部署成 Web App

1. 右上角點 **部署** → **新增部署作業**
2. 類型選 **網頁應用程式**
3. `Execute as`（執行身分）選：**Me**
4. `Who has access`（誰可存取）選：**Anyone**
5. 按部署，複製 Web App URL（通常結尾是 `/exec`）

> 每次你改了 `Code.gs`，都要再部署新版本，URL 通常不變。

---

## 4) 前端設定 Endpoint

回到你的 AdsPreview 網站：

1. 在 **Send to Cloud** 區塊
2. 把剛剛的 Web App URL 貼到 `Endpoint URL`
3. 上傳素材後按 **Send to Cloud**

> 本機開發（`localhost`）時，前端會用表單 POST 送出並開新分頁顯示 Apps Script JSON 回應，這是為了避開瀏覽器 CORS 限制。

成功後你會看到：
- 成功訊息
- 新分頁顯示 JSON 回應（`ok: true`）

---

## 5) 資料會存到哪裡？

- **Google Drive**：每次提交會自動建立一個子資料夾，放該次素材
- **Google Sheet**：新增一列，包含
  - campaign/page/文案/CTA/ratio
  - 單素材連結
  - 輪播素材連結（多筆）
  - 該次提交資料夾連結

---

## 6) 常見問題排查

### 問題：前端顯示 `Send failed`
- 檢查 Endpoint URL 是否為最新部署的 `/exec`
- 檢查 `SHEET_ID` 是否正確
- 檢查 Apps Script 是否已部署為 `Anyone`

### 問題：有建立資料夾，但 Sheet 沒資料
- 檢查 `SHEET_ID` 是否同一個帳號可存取
- 重新部署 Web App 後再測一次

### 問題：大影片上傳失敗
- Apps Script 有執行時間與請求大小限制
- 建議影片先控制在較小檔案（壓縮後再上傳）

---

## 7) 成本說明（你要的免費方案）

- Google Apps Script、Google Drive、Google Sheet 都有免費額度
- 在一般小型團隊/客戶提交流程可 0 成本運作
- 若未來流量大、影片很大，再升級到 Cloud Run/S3 類方案

---

## 8) 建議下一步（可選）

你可以再加兩個免費能力：

1. **提交密碼/Token 驗證**：避免陌生人打你的 endpoint
2. **自動寄信通知**：每次有新提交，寄 Gmail 通知你
