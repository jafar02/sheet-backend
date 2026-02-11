const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const { getData } = require("./sheet.service");
const {
  calculateOverview,
  buildCorrelationData
} = require("./metrics");

app.use(cors());
app.use(express.json());

/* ========================
   API ROUTES
======================== */

app.get("/api/overview", async (req, res) => {
  const members = await getData();
  res.json(calculateOverview(members));
});

app.get("/api/members", async (req, res) => {
  const members = await getData();
  res.json(members);
});

app.get("/api/correlations", async (req, res) => {
  const members = await getData();
  res.json(buildCorrelationData(members));
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

// Refresh every 60 sec
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

server.listen(3000, () => {
  console.log("🚀 Server running with WebSocket on port 3000");
});
