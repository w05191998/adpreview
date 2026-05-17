const CONFIG = {
  // Required: Google Sheet that stores submissions
  SHEET_ID: '1Z9pmZryHXxQrRIH-zx5_f-QT6A9QCI1Ux2kLhiI7brQ',
  SHEET_NAME: 'Submissions',

  // Optional: Drive folder to store assets. Leave empty to use My Drive root.
  DRIVE_FOLDER_ID: '1FObbWJjF-rvxOMY2Io0s4pYbzCOQn1WT',
}

const SHEET_HEADERS = [
  'submitted_at',
  'campaign_name',
  'page_name',
  'creative_type',
  'media_ratio',
  'cta_label',
  'destination_url',
  'primary_text',
  'headline',
  'description',
  'single_asset_url',
  'carousel_asset_urls',
  'submission_folder_url',
]

function doGet() {
  return jsonResponse({
    ok: true,
    message: 'Apps Script endpoint is running.',
  })
}

function doPost(e) {
  try {
    const payload = parseIncomingPayload(e)
    const metadata = payload.metadata || {}
    const form = metadata.form || {}

    const parentFolder = getDriveFolder()
    const submissionFolder = createSubmissionFolder(parentFolder, form.campaignName)

    let singleAssetUrl = ''
    if (payload.singleAsset && payload.singleAsset.base64Data) {
      const singleFile = saveBase64Asset(payload.singleAsset, submissionFolder, 'single')
      singleAssetUrl = singleFile.getUrl()
    }

    const carouselAssets = Array.isArray(payload.carouselAssets) ? payload.carouselAssets : []
    const carouselUrls = carouselAssets
      .filter((asset) => asset && asset.base64Data)
      .map((asset, index) => {
        const file = saveBase64Asset(asset, submissionFolder, 'carousel_' + (index + 1))
        return file.getUrl()
      })

    appendSubmissionRow({
      submittedAt: metadata.submittedAt || new Date().toISOString(),
      form: form,
      creativeType: metadata.creativeType || '',
      mediaRatioKey: metadata.mediaRatioKey || '',
      singleAssetUrl: singleAssetUrl,
      carouselAssetUrls: carouselUrls.join('\n'),
      submissionFolderUrl: submissionFolder.getUrl(),
    })

    const sheetUrl = SpreadsheetApp.openById(CONFIG.SHEET_ID).getUrl()

    return jsonResponse({
      ok: true,
      message: 'Submission saved successfully.',
      url: submissionFolder.getUrl(),
      driveUrl: submissionFolder.getUrl(),
      sheetUrl: sheetUrl,
    })
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: error.message || 'Unknown error',
      },
      500,
    )
  }
}

function parseIncomingPayload(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload)
  }

  if (e && e.postData && e.postData.contents) {
    const rawBody = e.postData.contents
    try {
      return JSON.parse(rawBody)
    } catch (error) {
      const parsed = parseUrlEncodedBody(rawBody)
      if (parsed.payload) {
        return JSON.parse(parsed.payload)
      }
    }
  }

  throw new Error('Missing request payload.')
}

function parseUrlEncodedBody(rawBody) {
  const result = {}
  if (!rawBody) {
    return result
  }

  rawBody.split('&').forEach((pair) => {
    if (!pair) {
      return
    }
    const parts = pair.split('=')
    const key = decodeURIComponent(parts[0] || '').replace(/\+/g, ' ')
    const value = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '))
    result[key] = value
  })

  return result
}

function getDriveFolder() {
  if (CONFIG.DRIVE_FOLDER_ID) {
    return DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID)
  }
  return DriveApp.getRootFolder()
}

function createSubmissionFolder(parentFolder, campaignName) {
  const safeName = (campaignName || 'ad_submission').toString().replace(/[^\w.-]/g, '_')
  const folderName = 'ad_submission_' + safeName + '_' + Date.now()
  return parentFolder.createFolder(folderName)
}

function saveBase64Asset(asset, folder, fallbackPrefix) {
  const fileName = (asset.fileName || fallbackPrefix + '.bin').toString()
  const mimeType = (asset.mimeType || 'application/octet-stream').toString()
  const bytes = Utilities.base64Decode(asset.base64Data)
  const blob = Utilities.newBlob(bytes, mimeType, fileName)
  return folder.createFile(blob)
}

function appendSubmissionRow(data) {
  const sheet = ensureSheet()
  sheet.appendRow([
    data.submittedAt || '',
    data.form.campaignName || '',
    data.form.pageName || '',
    data.creativeType || '',
    data.mediaRatioKey || '',
    data.form.ctaLabel || '',
    data.form.destinationUrl || '',
    data.form.primaryText || '',
    data.form.headline || '',
    data.form.description || '',
    data.singleAssetUrl || '',
    data.carouselAssetUrls || '',
    data.submissionFolderUrl || '',
  ])
}

function ensureSheet() {
  if (!CONFIG.SHEET_ID || CONFIG.SHEET_ID === 'PUT_YOUR_GOOGLE_SHEET_ID_HERE') {
    throw new Error('Please set CONFIG.SHEET_ID in Code.gs first.')
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID)
  let sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME)

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME)
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS])
  }

  return sheet
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
