/**
 * db.js — אחסון הודעות בזיכרון (עם גיבוי ל-JSON)
 * בפרודקשן אפשר להחליף ב-Redis או Postgres
 */

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/messages.json");
const MEMBERS_FILE = path.join(__dirname, "../data/members.json");

// ---- אחסון הודעות ----
let messages = [];

// טען הודעות קיימות מהקובץ
try {
  if (fs.existsSync(DATA_FILE)) {
    messages = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
} catch { messages = []; }

function save() {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2));
  } catch (e) {
    console.error("שגיאה בשמירה:", e.message);
  }
}

function addMessage(msg) {
  messages.push({ ...msg, id: Date.now() });
  save();
}

function getMessages() {
  return [...messages];
}

function clearMessages() {
  messages = [];
  save();
}

// ---- שמות בני משפחה לפי מספר טלפון ----
let members = {};
try {
  if (fs.existsSync(MEMBERS_FILE)) {
    members = JSON.parse(fs.readFileSync(MEMBERS_FILE, "utf8"));
  }
} catch { members = {}; }

function getMemberName(phoneNumber) {
  return members[phoneNumber] || null;
}

module.exports = { addMessage, getMessages, clearMessages, getMemberName };
