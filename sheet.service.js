console.log("NEW VERSION LOADED");
const { google } = require("googleapis");  
const { rowsToObjects } = require("./data.processor");

let cachedData = [];
let lastUpdated = null;

const spreadsheetId =
  process.env.SPREADSHEET_ID ||
  "1AN8DvIfCdLyykul3znbyVw7fzizvsQxbMRV0pyKZc8s";

const range = process.env.SHEET_RANGE || "Sheet1";

/* =========================
   AUTH CONFIG
========================= */

let auth;

if (process.env.GOOGLE_CREDENTIALS) {
  console.log("🔐 Using Railway credentials");
  auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
} else {
  console.log("🔐 Using local service-account.json");
  auth = new google.auth.GoogleAuth({
    keyFile: "service-account.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

/* =========================
   READ SHEET
========================= */

async function readSheet() {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
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
    console.log("⚠️ Using cached data instead.");
    return cachedData;
  }
}

/* =========================
   GET DATA
========================= */

async function getData() {
  if (cachedData.length === 0) {
    await readSheet();
  }
  return cachedData;
}

/* =========================
   AUTO REFRESH
========================= */

setInterval(readSheet, 60000);

module.exports = {
  readSheet,
  getData,
};
