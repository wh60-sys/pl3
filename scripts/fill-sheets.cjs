/**
 * Google Sheets Auto-Fill Script
 * 
 * Usage:
 *   1. Setup Google Cloud Project (see scripts/setup-gcloud.md)
 *   2. Download service account key → scripts/credentials.json
 *   3. Share spreadsheet to service account email
 *   4. Run: node scripts/fill-sheets.cjs
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Configuration
const SPREADSHEET_ID = '1O_s4A67NkLvI9Asz1CZszPNEAnQliIWV91UbTut7-Q8';
const SHEET_NAME = 'Sheet1';
const CREDS_PATH = path.join(__dirname, 'credentials.json');

// Packing lines configuration
const PACKING_LINES = ['Packing 1', 'Packing 2', 'Packing 3', 'Packing 4'];
const PRODUCTS = {
  'Packing 1': 'PN - 60x60 - 8679',
  'Packing 2': 'PN - 60x60 - 8679',
  'Packing 3': 'PN - 50x50R - 12600',
  'Packing 4': 'PN - 50x50R - 12600'
};
const TARGETS = {
  'Packing 1': 364,
  'Packing 2': 362,
  'Packing 3': 526,
  'Packing 4': 524
};

// Generate random production data
function generateHourlyData(date, jam, shift) {
  const rows = [];
  
  for (const line of PACKING_LINES) {
    const target = TARGETS[line];
    // Random actual between 0-120% of target
    const pctCap = Math.random() * 120;
    const actual = Math.round((pctCap / 100) * target);
    // KWA between 75-100%
    const pctKwa = Math.round(75 + Math.random() * 25);
    
    rows.push([
      date,           // date
      shift,         // shift
      jam,           // jam
      line,          // packing_line
      PRODUCTS[line], // product_name
      target,       // dos_target
      actual,       // dos_actual
      Math.round(pctCap * 10) / 10, // pct_cap (1 decimal)
      pctKwa         // pct_kwa
    ]);
  }
  
  return rows;
}

// Generate full day data (24 hours)
function generateFullDayData(date) {
  const allRows = [];
  
  // Hours from 08:00 to 07:00 next day
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'
  ];
  
  for (const jam of hours) {
    let shift;
    const hour = parseInt(jam.split(':')[0]);
    if (hour >= 8 && hour <= 15) shift = 'SHIFT 1';
    else if (hour >= 16 && hour <= 23) shift = 'SHIFT 2';
    else shift = 'SHIFT 3';
    
    const hourData = generateHourlyData(date, jam, shift);
    allRows.push(...hourData);
  }
  
  return allRows;
}

// Main function to fill sheets
async function fillGoogleSheets() {
  try {
    // Check credentials file exists
    if (!fs.existsSync(CREDS_PATH)) {
      console.log('❌ credentials.json not found!');
      console.log(`   Expected path: ${CREDS_PATH}`);
      console.log('   Please follow: scripts/setup-gcloud.md');
      process.exit(1);
    }
    
    // Load service account credentials
    console.log('🔐 Loading credentials...');
    const credentials = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    // Create sheets API client
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get current data to check existing data
    console.log('📊 Checking existing data...');
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`
    });
    
    const existingRows = getResponse.data.values?.length || 0;
    console.log(`   Found ${existingRows} existing rows`);
    
    // Generate header
    const header = [['date', 'shift', 'jam', 'packing_line', 'product_name', 'dos_target', 'dos_actual', 'pct_cap', 'pct_kwa']];
    
    // Generate today's data
    const today = new Date().toISOString().slice(0, 10);
    console.log(`📅 Generating data for ${today}...`);
    
    const data = generateFullDayData(today);
    console.log(`   Generated ${data.length} data rows`);
    
    // Clear existing data (keep header) starting from row 2
    if (existingRows > 1) {
      console.log('🗑️  Clearing existing data (row 2 onwards)...');
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:Z`
      });
    }
    
    // Write header
    console.log('✍️  Writing header...');
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:I1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: header }
    });
    
    // Write data in batches (24 rows per batch - 4 packing lines × 6 hours)
    console.log('✍️  Writing production data...');
    const batchSize = 24;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const rowStart = Math.floor(i / batchSize) * batchSize + 2;
      const rowEnd = rowStart + batch.length - 1;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A${rowStart}:I${rowEnd}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: batch }
      });
      
      const progress = Math.round(((i + batchSize) / data.length) * 100);
      console.log(`   Progress: ${progress}%`);
    }
    
    console.log('✅ Successfully filled Google Sheets!');
    console.log(`   Spreadsheet ID: ${SPREADSHEET_ID}`);
    console.log(`   Sheet: ${SHEET_NAME}`);
    console.log(`   Total rows: ${data.length}`);
    console.log(`   Date: ${today}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   API Response:', JSON.stringify(error.response.data));
    }
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  fillGoogleSheets();
}

module.exports = { fillGoogleSheets, generateFullDayData, generateHourlyData };