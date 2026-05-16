require('dotenv').config();

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SPREADSHEET_ID = '1O_s4A67NkLvI9Asz1CZszPNEAnQliIWV91UbTut7-Q8';
const SHEET_NAME = 'Sheet1';
const RANGE = 'A2:I999';
const CREDS_PATH = path.join(__dirname, 'credentials.json');

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

// Real data for 08:00
const DATA_08 = {
  'Packing 1': { dos: 379, pct_cap: 105, pct_kwa: 79 },
  'Packing 2': { dos: 358, pct_cap: 99, pct_kwa: 95 },
  'Packing 3': { dos: 552, pct_cap: 105, pct_kwa: 83 },
  'Packing 4': { dos: 409, pct_cap: 78, pct_kwa: 94 }
};

// Real data for 09:00
const DATA_09 = {
  'Packing 1': { dos: 421, pct_cap: 116, pct_kwa: 82 },
  'Packing 2': { dos: 368, pct_cap: 102, pct_kwa: 91 },
  'Packing 3': { dos: 553, pct_cap: 105, pct_kwa: 89 },
  'Packing 4': { dos: 506, pct_cap: 96, pct_kwa: 88 }
};

function generateHourlyData(date, jam, shift) {
  const rows = [];
  
  let dataMap;
  if (jam === '08:00') dataMap = DATA_08;
  else if (jam === '09:00') dataMap = DATA_09;
  else dataMap = null;
  
  for (const line of PACKING_LINES) {
    const target = TARGETS[line];
    let actual, pctCap, pctKwa;
    
    if (dataMap) {
      actual = dataMap[line].dos;
      pctCap = dataMap[line].pct_cap;
      pctKwa = dataMap[line].pct_kwa;
    } else {
      actual = 0;
      pctCap = 0;
      pctKwa = 0;
    }
    
    rows.push([date, shift, jam, line, PRODUCTS[line], target, actual, pctCap, pctKwa]);
  }
  return rows;
}

function generateFullDayData(date) {
  const allRows = [];
  
  // Generate hours 00-23 with proper leading zero
  for (let hour = 0; hour < 24; hour++) {
    const jam = String(hour).padStart(2, '0') + ':00';
    
    let shift;
    if (hour >= 8 && hour <= 15) shift = 'SHIFT 1';
    else if (hour >= 16 && hour <= 23) shift = 'SHIFT 2';
    else shift = 'SHIFT 3';
    
    allRows.push(...generateHourlyData(date, jam, shift));
  }
  
  return allRows;
}

async function main() {
  const credentials = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
  const sheets = google.sheets({ version: 'v4', auth });

  // BUG 2 FIX: Use Jakarta timezone (UTC+7)
  const now = new Date();
  const jakartaOffset = 7 * 60 * 60 * 1000; // 7 hours in ms
  const jakartaTime = new Date(now.getTime() + jakartaOffset);
  const date = jakartaTime.toISOString().slice(0, 10);
  
  console.log(`📅 Generating data for ${date} (WIB)...`);
  const data = generateFullDayData(date);
  console.log(`   Generated ${data.length} rows`);

  console.log('\n📊 Sample:');
  data.slice(0, 8).forEach(row => console.log(`   ${row[2]} ${row[3]}: dos=${row[6]}, cap=${row[7]}%, kwa=${row[8]}%`));

  console.log('\n🗑️  Clearing...');
  try {
    await sheets.spreadsheets.values.clear({ spreadsheetId: SPREADSHEET_ID, range: RANGE });
  } catch (e) { console.log('   No data to clear'); }

  console.log('\n✍️  Writing...');
  const result = await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A2`,
    valueInputOption: 'RAW',
    requestBody: { values: data }
  });

  console.log('\n✅ Success!');
  console.log(`   Updated: ${result.data.updatedCells} cells`);
}

main().catch(err => { console.error('\n❌ Error:', err.message); process.exit(1); });