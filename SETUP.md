# 🛒 סוכן הקניות המשפחתי — מדריך התקנה מלא

## מה תצטרך (הכל חינם לשימוש בסיסי)

| שירות | לשם מה | עלות |
|-------|--------|------|
| **Twilio** | מחבר לוואטסאפ | חינם (Sandbox) |
| **Railway** | מריץ את השרת | חינם (500 שעות/חודש) |
| **Anthropic** | ה-AI שמנתח | $5 קרדיט ראשוני |

---

## שלב 1 — הכן את הקוד

### אפשרות א׳: GitHub (מומלץ)
1. צור repository חדש ב-[github.com](https://github.com)
2. העלה את כל הקבצים לתוכו

### אפשרות ב׳: מחשב מקומי
```bash
# התקן Node.js מ: https://nodejs.org (גרסה 18+)
npm install
cp .env.example .env
```

---

## שלב 2 — חשבון Anthropic (Claude API)

1. כנס ל-[console.anthropic.com](https://console.anthropic.com)
2. הירשם ← **API Keys** ← **Create Key**
3. שמור את המפתח: `sk-ant-...`

---

## שלב 3 — חשבון Twilio + WhatsApp Sandbox

### 3.1 פתח חשבון
1. כנס ל-[twilio.com](https://www.twilio.com) ← **Sign Up** (חינם)
2. אמת את מספר הטלפון שלך

### 3.2 הפעל WhatsApp Sandbox
1. בלוח Twilio: **Messaging** ← **Try it out** ← **Send a WhatsApp message**
2. תראה מספר Sandbox (בד"כ `+14155238886`) וקוד הצטרפות
3. **כל בן משפחה** צריך לשלוח את קוד ההצטרפות למספר זה:
   ```
   join <קוד>
   ```
   לדוגמה: `join apple-mango`

---

## שלב 4 — Deploy ל-Railway

### 4.1 צור פרויקט
1. כנס ל-[railway.app](https://railway.app) ← **Login with GitHub**
2. **New Project** ← **Deploy from GitHub repo** ← בחר את ה-repo שלך
3. Railway יזהה Node.js אוטומטית ויתחיל לבנות

### 4.2 הגדר משתני סביבה
ב-Railway ← **Variables** ← הוסף:

```
ANTHROPIC_API_KEY   =   sk-ant-xxxxxxxxxxxxx
ALLOWED_NUMBERS     =   +972501234567,+972521234568
PORT                =   3000
```

### 4.3 קבל את ה-URL
ב-Railway ← **Settings** ← **Domains** ← **Generate Domain**
תקבל כתובת כמו: `https://shopping-agent-production.up.railway.app`

---

## שלב 5 — חבר Twilio לשרת שלך

1. חזור ל-Twilio ← **Messaging** ← **Sandbox settings**
2. ב-**"When a message comes in"** הכנס:
   ```
   https://YOUR-URL.up.railway.app/webhook
   ```
   ✅ שיטה: **HTTP POST**
3. לחץ **Save**

---

## שלב 6 — הגדר שמות בני המשפחה

ערוך את הקובץ `data/members.json`:
```json
{
  "+972501234567": "אמא",
  "+972521234568": "אבא",
  "+972541234569": "דנה",
  "+972551234560": "יוסי"
}
```
העלה לGitHub ו-Railway יתעדכן אוטומטית.

---

## בדיקה

### בדיקה מהירה
```bash
# בדוק שהשרת עולה
curl https://YOUR-URL.up.railway.app/health
# תשובה: {"status":"ok"}
```

### מוואטסאפ
1. שלח הודעה: `"צריך חלב ולחם"`
2. תקבל: `✅ קיבלתי! הוספתי לרשימה...`
3. שלח: `רשימה`
4. תקבל את הרשימה המסודרת!

---

## פקודות וואטסאפ

| פקודה | תוצאה |
|-------|-------|
| כל הודעה רגילה | נשמרת לרשימה |
| `רשימה` | מייצר ושולח רשימת קניות מסודרת |
| `נקה` | מוחק את כל הבקשות |
| `עזרה` | מציג הוראות |

---

## שדרוגים עתידיים

- **שליחה אוטומטית** — שלח את הרשימה בשעה קבועה (cron job)
- **Twilio Production** — עבור לוואטסאפ Business API אמיתי (ללא Sandbox)
- **מסד נתונים** — החלף את ה-JSON ב-PostgreSQL (Railway מציע חינם)
- **ממשק ניהול** — חבר את ה-Artifact שבנינו ל-API endpoint `/list`

---

## עזרה

אם משהו לא עובד:
- **Railway logs**: לחץ על הפרויקט ← **Deployments** ← **View logs**
- **Twilio debugger**: Console ← **Monitor** ← **Errors & Warnings**
