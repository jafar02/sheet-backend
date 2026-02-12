const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

/* ========================
   SOCKET.IO SETUP
======================== */

const io = new Server(server, {
  cors: {
    origin: "*", // 🔒 In production, replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

/* ========================
   IMPORT SERVICES
======================== */

const { getData } = require("./sheet.service");
const {
  calculateOverview,
  buildCorrelationData,
} = require("./metrics");

/* ========================
   MIDDLEWARE
======================== */

app.use(cors());
app.use(express.json());

/* ========================
   ROOT & HEALTH CHECK
======================== */

// Root route (prevents 404 confusion)
app.get("/", (req, res) => {
  res.send("🚀 Sheet Analytics Backend is Running");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ========================
   API ROUTES
======================== */

app.get("/api/overview", async (req, res) => {
  try {
    const members = await getData();
    res.json(calculateOverview(members));
  } catch (err) {
    console.error("Overview error:", err.message);
    res.status(500).json({ error: "Failed to fetch overview" });
  }
});

app.get("/api/members", async (req, res) => {
  try {
    const members = await getData();
    res.json(members);
  } catch (err) {
    console.error("Members error:", err.message);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

app.get("/api/correlations", async (req, res) => {
  try {
    const members = await getData();
    res.json(buildCorrelationData(members));
  } catch (err) {
    console.error("Correlation error:", err.message);
    res.status(500).json({ error: "Failed to fetch correlations" });
  }
});

/* ========================
   AUTO REFRESH SHEET
======================== */

async function refreshSheet() {
  try {
    await getData();
    console.log("📄 Sheet refreshed");

    // 🔥 Notify frontend instantly
    io.emit("sheet-updated");
  } catch (err) {
    console.error("Sheet refresh error:", err.message);
  }
}

// Refresh every 60 seconds
setInterval(refreshSheet, 60000);

/* ========================
   SOCKET CONNECTION
======================== */

io.on("connection", (socket) => {
  console.log("⚡ Frontend connected:", socket.id);
});

/* ========================
   START SERVER
======================== */

const PORT = process.env.PORT || 3000;

// 🔥 Load sheet immediately on startup
getData()
  .then(() => {
    console.log("📄 Initial sheet load complete");
  })
  .catch((err) => {
    console.error("Initial sheet load failed:", err.message);
  });

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
