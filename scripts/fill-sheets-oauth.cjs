/**
 * Google Sheets Auto-Fill Script (OAuth2 Browser Version)
 * 
 * Easier setup for development - uses OAuth2 via browser authentication.
 * For production, use fill-sheets.js with service account.
 * 
 * Usage:
 *   node scripts/fill-sheets-oauth.js
 * 
 * This will open a browser for authentication.
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || '1O_s4A67NkLvI9Asz1CZszPNEAnQliIWV91UbTut7-Q8';
const SHEET_NAME = 'Sheet1';
const TOKEN_PATH = path.join(__dirname, '..', 'scripts', 'token.json');
const CREDS_PATH = path.join(__dirname, '..', 'scripts', 'credentials.json');

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
    const pctCap = Math.random() * 120;
    const actual = Math.round((pctCap / 100) * target);
    const pctKwa = Math.round(75 + Math.random() * 25);
    
    rows.push([
      date,
      shift,
      jam,
      line,
      PRODUCTS[line],
      target,
      actual,
      pctCap,
      pctKwa
    ]);
  }
  
  return rows;
}

// Generate full day data
function generateFullDayData(date) {
  const allRows = [];
  
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

// Create OAuth2 client
async function getOAuth2Client() {
  const { OAuth2Client } = require('googleapis').google.auth;
  
  // Load client secrets
  let credentials;
  if (fs.existsSync(CREDS_PATH)) {
    credentials = JSON.parse(fs.readFileSync(CREDS_PATH, 'utf8'));
  } else {
    console.log('📝 Creating new credentials...');
    credentials = {
      installed: {
        client_id: process.env.CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com',
        client_secret: process.env.CLIENT_SECRET || 'YOUR_CLIENT_SECRET',
        redirect_uris: ['http://localhost']
      }
    };
  }
  
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);
  
  // Check for existing token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
  
  // Get new token
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  console.log('🔗 Authorize this app by visiting this URL:');
  console.log(authUrl);
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('📋 Enter the code from the page: ', async (code) => {
      rl.close();
      const { tokens } = await oAuth2Client.getToken(code);
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
      console.log('✅ Token stored!');
      resolve(oAuth2Client);
    });
  });
}

// Main function
async function fillGoogleSheets() {
  try {
    console.log('🔐 Authenticating...');
    const auth = await getOAuth2Client();
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get existing data
    console.log('📊 Checking existing data...');
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:A`
    });
    
    const existingRows = getResponse.data.values?.length || 0;
    console.log(`   Found ${existingRows} existing rows`);
    
    // Generate data
    const header = [['date', 'shift', 'jam', 'packing_line', 'product_name', 'dos_target', 'dos_actual', 'pct_cap', 'pct_kwa']];
    const today = new Date().toISOString().slice(0, 10);
    console.log(`📅 Generating data for ${today}...`);
    const data = generateFullDayData(today);
    
    // Clear existing data
    if (existingRows > 1) {
      console.log('🗑️  Clearing existing data...');
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A2:I`
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
    
    // Write data
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
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  fillGoogleSheets();
}

module.exports = { fillGoogleSheets, generateFullDayData };