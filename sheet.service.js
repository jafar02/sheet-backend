const { google } = require("googleapis");
const { rowsToObjects } = require("./data.processor");

let cachedData = [];
let lastUpdated = null;

// Use ENV variable in production
const spreadsheetId = process.env.SPREADSHEET_ID || "1AN8DvIfCdLyykul3znbyVw7fzizvsQxbMRV0pyKZc8s";
const range = process.env.SHEET_RANGE || "Sheet1";

const auth = new google.auth.GoogleAuth({
  credentials: process.env.GOOGLE_CREDENTIALS
    ? JSON.parse(process.env.GOOGLE_CREDENTIALS)
    : require("./service-account.json"),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});


/* =========================
   READ SHEET FUNCTION
========================= */
async function readSheet() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      console.warn("⚠️ Sheet returned empty data");
      return cachedData;
    }

    cachedData = rowsToObjects(rows);
    lastUpdated = new Date();

    console.log(
      `✅ Sheet refreshed: ${cachedData.length} members at ${lastUpdated.toLocaleTimeString()}`
    );

    return cachedData;

  } catch (error) {
    console.error("❌ Error reading Google Sheet:", error.message);

    // Do NOT crash server
    console.log("⚠️ Using cached data instead.");

    return cachedData;
  }
}

/* =========================
   GET DATA FUNCTION
========================= */
async function getData() {
  // If no data loaded yet, load once
  if (cachedData.length === 0) {
    await readSheet();
  }

  return cachedData;
}

/* =========================
   AUTO REFRESH EVERY 1 MIN
========================= */
setInterval(() => {
  readSheet();
}, 60000); // 60 seconds

module.exports = {
  readSheet,
  getData
};
