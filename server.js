const express = require("express");
const { MessagingResponse } = require("twilio").twiml;
const Anthropic = require("@anthropic-ai/sdk");
const db = require("./db");
const { generateShoppingList } = require("./agent");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ---- Webhook מ-Twilio: מקבל הודעות וואטסאפ ----
app.post("/webhook", async (req, res) => {
  const from = req.body.From;   // e.g. "whatsapp:+972501234567"
  const body = req.body.Body?.trim();
  const twiml = new MessagingResponse();

  // בדוק אם השולח מורשה (בני המשפחה)
  const allowed = process.env.ALLOWED_NUMBERS?.split(",").map(n => n.trim()) || [];
  const fromNumber = from.replace("whatsapp:", "");
  if (allowed.length > 0 && !allowed.includes(fromNumber)) {
    twiml.message("מספר זה אינו מורשה לשלוח הודעות לסוכן הקניות.");
    return res.type("text/xml").send(twiml.toString());
  }

  const lowerBody = body?.toLowerCase();

  // פקודות מיוחדות
  if (lowerBody === "רשימה" || lowerBody === "list") {
    const messages = db.getMessages();
    if (messages.length === 0) {
      twiml.message("אין עדיין בקשות קניות. שלחו הודעות עם מה שצריך לקנות!");
    } else {
      const list = await generateShoppingList(client, messages);
      twiml.message(list);
    }
    return res.type("text/xml").send(twiml.toString());
  }

  if (lowerBody === "נקה" || lowerBody === "clear") {
    db.clearMessages();
    twiml.message("✅ הרשימה נוקתה! אפשר להתחיל מחדש.");
    return res.type("text/xml").send(twiml.toString());
  }

  if (lowerBody === "עזרה" || lowerBody === "help") {
    twiml.message(
      "🛒 *סוכן הקניות המשפחתי*\n\n" +
      "פשוט שלחו מה צריך לקנות, ואני אאסוף הכל.\n\n" +
      "*פקודות:*\n" +
      "• *רשימה* — הצג רשימת קניות מסודרת\n" +
      "• *נקה* — נקה את כל הבקשות\n" +
      "• *עזרה* — הצג הודעה זו"
    );
    return res.type("text/xml").send(twiml.toString());
  }

  // שמור את ההודעה
  const name = db.getMemberName(fromNumber) || fromNumber;
  db.addMessage({ from: fromNumber, name, text: body, time: new Date().toISOString() });

  twiml.message(`✅ קיבלתי! הוספתי לרשימה:\n"${body}"\n\nשלח *רשימה* לקבלת הרשימה המלאה.`);
  res.type("text/xml").send(twiml.toString());
});

// ---- נקודת קצה לצפייה ברשימה דרך API ----
app.get("/list", async (req, res) => {
  const messages = db.getMessages();
  if (messages.length === 0) {
    return res.json({ items: [], message: "אין עדיין בקשות קניות." });
  }
  const list = await generateShoppingList(client, messages, true);
  res.json(list);
});

app.get("/messages", (req, res) => {
  res.json(db.getMessages());
});

app.delete("/messages", (req, res) => {
  db.clearMessages();
  res.json({ ok: true });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🛒 Shopping Agent listening on port ${PORT}`));
