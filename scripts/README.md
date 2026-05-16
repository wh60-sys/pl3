# Google Sheets Auto-Fill Scripts

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Sheets API** and **Google Drive API**
4. Go to **IAM & Admin** → **Service Accounts**
5. Create a service account
6. Download the JSON key file
7. Copy it to `scripts/credentials.json`

### 2. Share Google Sheet

1. Open your Google Sheet
2. Click **Share**
3. Add the service account email (from credentials.json)
4. Give it **Editor** access

### 3. Configure Environment

```bash
# Set spreadsheet ID
export GOOGLE_SHEETS_ID=1O_s4A67NkLvI9Asz1CZszPNEAnQliIWV91UbTut7-Q8

# Set credentials path
export GOOGLE_APPLICATION_CREDENTIALS=./scripts/credentials.json
```

### 4. Run the Script

```bash
# One-time fill
node scripts/fill-sheets.js

# Or with PM2 for continuous scheduling
pm2 start scripts/fill-sheets.js --interva 3600000  # every hour
```

## Files

- `fill-sheets.js` - Main script to fill Google Sheets
- `credentials.json.example` - Template for service account credentials

## Features

- Generates realistic production data
- Supports 4 packing lines
- 24-hour data (08:00 - 07:00)
- Random % Achievement (0-120%)
- Random % KWA (75-100%)
- Batch writing for efficiency