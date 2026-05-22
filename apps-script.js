/**
 * Google Apps Script - paste this into your sheet's script editor
 *
 * Setup:
 * 1. Create a new Google Sheet
 * 2. Extensions > Apps Script
 * 3. Paste this code
 * 4. Deploy > New deployment > Web app
 * 5. Execute as: Me
 * 6. Who has access: Anyone
 * 7. Copy the URL and paste into app.js CONFIG.SCRIPT_URL
 */

// Handle GET requests - not used, but kept for testing
function doGet(e) {
  return ContentService.createTextOutput('Use POST');
}

function getStats(data) {
  const stats = {
    total: 0,
    datesHigh: {},
    datesLow: {},
    cereals: {},
    milk: {},
    juice: {}
  };

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    if (!data[i][1]) continue; // Skip empty rows
    stats.total++;

    // Dates High (column C)
    const datesHigh = String(data[i][2] || '');
    if (datesHigh) {
      datesHigh.split(', ').forEach(d => {
        const date = d.trim();
        if (date) stats.datesHigh[date] = (stats.datesHigh[date] || 0) + 1;
      });
    }

    // Dates Low (column D)
    const datesLow = String(data[i][3] || '');
    if (datesLow) {
      datesLow.split(', ').forEach(d => {
        const date = d.trim();
        if (date) stats.datesLow[date] = (stats.datesLow[date] || 0) + 1;
      });
    }

    // Cereals (column E)
    const cereals = String(data[i][4] || '');
    if (cereals) {
      cereals.split(', ').forEach(c => {
        const cereal = c.trim();
        if (cereal) stats.cereals[cereal] = (stats.cereals[cereal] || 0) + 1;
      });
    }

    // Milk (column F)
    const milk = String(data[i][5] || '').trim();
    if (milk) stats.milk[milk] = (stats.milk[milk] || 0) + 1;

    // Juice (column G)
    const juice = String(data[i][6] || '').trim();
    if (juice) stats.juice[juice] = (stats.juice[juice] || 0) + 1;
  }

  return stats;
}

// Handle POST requests - all actions
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const input = JSON.parse(e.postData.contents);

  // Stats request
  if (input.action === 'stats') {
    const data = sheet.getDataRange().getValues();
    return jsonResponse({ stats: getStats(data) });
  }

  // User lookup (optionally include stats)
  if (input.action === 'lookup') {
    const data = sheet.getDataRange().getValues();
    const name = input.name;
    const result = { found: false };

    if (name) {
      for (let i = data.length - 1; i >= 1; i--) {
        if (data[i][1] && data[i][1].toString().toLowerCase() === name.toLowerCase()) {
          result.found = true;
          result.datesHigh = String(data[i][2] || '');
          result.datesLow = String(data[i][3] || '');
          result.cereals = String(data[i][4] || '');
          result.milk = String(data[i][5] || '');
          result.juice = String(data[i][6] || '');
          break;
        }
      }
    }

    if (input.includeStats) {
      result.stats = getStats(data);
    }

    return jsonResponse(result);
  }

  // Save/update - default action
  const data = input;

  // Add headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp',
      'Name',
      'Dates (Yes!)',
      'Dates (If needed)',
      'Cereals',
      'Milk',
      'Juice'
    ]);
  }

  const rowData = [
    new Date(),
    data.name,
    data.datesHigh.join(', '),
    data.datesLow.join(', '),
    data.cereals.join(', '),
    data.milk,
    data.juice
  ];

  if (data.isUpdate) {
    // Find and update existing row
    const allData = sheet.getDataRange().getValues();
    for (let i = allData.length - 1; i >= 1; i--) {
      if (allData[i][1] && allData[i][1].toString().toLowerCase() === data.name.toLowerCase()) {
        sheet.getRange(i + 1, 1, 1, 7).setValues([rowData]);
        return ContentService.createTextOutput('updated');
      }
    }
  }

  // Append new row
  sheet.appendRow(rowData);
  return ContentService.createTextOutput('ok');
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Test functions
function testGet() {
  const mockEvent = { parameter: { name: 'Test User' } };
  const result = doGet(mockEvent);
  Logger.log(result.getContent());
}

function testPost() {
  const mockEvent = {
    postData: {
      contents: JSON.stringify({
        name: 'Test User',
        datesHigh: ['2026-06-04', '2026-06-05'],
        datesLow: ['2026-06-06'],
        cereals: ['lucky-charms', 'capn-crunch'],
        milk: 'regular',
        juice: 'orange',
        isUpdate: false
      })
    }
  };
  doPost(mockEvent);
}
