/**
 * Simple Google Sheets Filler - Uses public export URL
 * 
 * This script generates random production data and writes it to a local CSV file
 * that can be imported into Google Sheets.
 * 
 * For automatic writing via API, use fill-sheets.js with service account credentials.
 * 
 * Usage: node scripts/fill-sheets-simple.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'production-data.csv');
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
    
    rows.push({
      date,
      shift,
      jam,
      packing_line: line,
      product_name: PRODUCTS[line],
      dos_target: target,
      dos_actual: actual,
      pct_cap: Math.round(pctCap * 10) / 10,
      pct_kwa: pctKwa
    });
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

// Convert to CSV
function toCSV(data) {
  const headers = ['date', 'shift', 'jam', 'packing_line', 'product_name', 'dos_target', 'dos_actual', 'pct_cap', 'pct_kwa'];
  const headerRow = headers.join(',');
  
  const rows = data.map(row => {
    return headers.map(h => {
      const val = row[h];
      // Quote strings with commas
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    }).join(',');
  });
  
  return [headerRow, ...rows].join('\n');
}

// Main function
function main() {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`📅 Generating data for ${today}...`);
  
  const data = generateFullDayData(today);
  
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Write CSV
  const csv = toCSV(data);
  fs.writeFileSync(OUTPUT_FILE, csv);
  
  console.log(`✅ Data written to ${OUTPUT_FILE}`);
  console.log(`   Total rows: ${data.length}`);
  console.log(`   Hours: 24`);
  console.log(`   Packing Lines: 4`);
  
  // Show sample
  console.log('\n📊 Sample data:');
  console.log(data.slice(0, 4).map(r => 
    `${r.date}, ${r.shift}, ${r.jam}, ${r.packing_line}, ${r.dos_actual}, ${r.pct_cap}%, ${r.pct_kwa}%`
  ).join('\n'));
}

main();