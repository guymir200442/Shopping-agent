/**
 * agent.js — הלוגיקה של ה-AI שמנתח הודעות ומייצר רשימת קניות
 */

const SYSTEM_PROMPT = `אתה סוכן קניות חכם שמנתח הודעות וואטסאפ מבני משפחה ומייצר רשימת קניות מסודרת.

כללים:
1. איחד פריטים כפולים או דומים לפריט אחד
2. סדר לפי קטגוריות: ירקות ופירות, מוצרי חלב, בשר ודגים, לחם ומאפים, שתייה, חטיפים וממתקים, ניקיון ותחזוקה, מוצרי טיפוח, שימורים ויבשים, קפואים, אחר
3. ציין כמויות אם נזכרו
4. אל תכלול קטגוריות ריקות`;

/**
 * מייצר רשימת קניות בפורמט טקסט (לוואטסאפ) או JSON (ל-API)
 */
async function generateShoppingList(client, messages, asJson = false) {
  const messagesText = messages
    .map(m => `${m.name} (${formatTime(m.time)}): "${m.text}"`)
    .join("\n");

  const jsonInstruction = asJson
    ? `החזר תשובה ב-JSON בלבד, ללא טקסט נוסף, בפורמט:
{
  "categories": [{ "name": "שם קטגוריה", "items": ["פריט 1", "פריט 2"] }],
  "total_items": 5,
  "summary": "משפט קצר"
}`
    : `החזר את הרשימה בפורמט וואטסאפ ידידותי עם אמוג'י, קטגוריות ופריטים ברורים. בסוף הוסף את מספר הפריטים הכולל.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `הנה ההודעות מבני המשפחה:\n\n${messagesText}\n\n${jsonInstruction}`,
      },
    ],
  });

  const text = response.content.map(b => b.text || "").join("");

  if (asJson) {
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return { error: "לא ניתן לנתח תשובה", raw: text };
    }
  }

  return text;
}

function formatTime(isoString) {
  try {
    const d = new Date(isoString);
    return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
  } catch {
    return "";
  }
}

module.exports = { generateShoppingList };
