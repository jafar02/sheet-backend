let credentials;

try {
  if (process.env.GOOGLE_CREDENTIALS) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log("🔐 Using Railway credentials");
  } else {
    credentials = require("./service-account.json");
    console.log("🔐 Using local credentials");
  }
} catch (err) {
  console.error("❌ Failed to parse credentials:", err.message);
  process.exit(1); // Crash clearly instead of silent failure
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
