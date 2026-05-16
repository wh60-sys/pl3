/**
 * Google Sheets Auto-Fill Script (Hourly - Append Mode)
 * 
 * Generates data for CURRENT HOUR only and appends to sheet.
 * Does NOT replace existing data.
 * 
 * Usage:
 *   node scripts/auto-fill.cjs
 * 
 * Cron: Run every hour at :00
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

// Get current hour in HH:00 format
function getCurrentHour() {
  const now = new Date();
  const hour = now.getHours();
  return `${hour.toString().padStart(2, '0')}:00`;
}

// Get current shift
function getCurrentShift() {
  const hour = new Date().getHours();
  if (hour >= 8 && hour <= 15) return 'SHIFT 1';
  if (hour >= 16 && hour <= 23) return 'SHIFT 2';
  return 'SHIFT 3';
}

// Get today's date in YYYY-MM-DD
function getToday() {
  return new Date().toISOString().slice(0, 10);
}

// Generate data for current hour only
function generateCurrentHourData() {
  const date = getToday();
  const jam = getCurrentHour();
  const shift = getCurrentShift();
  
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

// Main function
async function autoFill() {
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
    
    // Get current data to find last row
    console.log('📊 Checking existing data...');
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`
    });
    
    const existingRows = getResponse.data.values?.length || 0;
    console.log(`   Found ${existingRows} existing rows`);
    
    // Generate current hour data
    const data = generateCurrentHourData();
    const jam = data[0][2];
    const shift = data[0][1];
    console.log(`📅 Generating data for ${jam} (${shift})...`);
    
    // Find next empty row (append after existing data)
    const nextRow = existingRows + 1;
    console.log(`📝 Appending at row ${nextRow}...`);
    
    // Write data
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${nextRow}:I${nextRow + data.length - 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: data }
    });
    
    console.log('✅ Successfully appended to Google Sheets!');
    console.log(`   Spreadsheet ID: ${SPREADSHEET_ID}`);
    console.log(`   Sheet: ${SHEET_NAME}`);
    console.log(`   Rows written: ${data.length}`);
    console.log(`   Time: ${jam} (${shift})`);
    
    // Show sample
    console.log('\n📊 Sample data:');
    data.forEach(row => {
      console.log(`   ${row[3]}: ${row[6]} dos (${row[7]}% cap, ${row[8]}% kwa)`);
    });
    
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
  autoFill();
}

module.exports = { autoFill, generateCurrentHourData, getCurrentHour, getCurrentShift };