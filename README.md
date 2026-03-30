# 🚀 E-Orbit CRM — دليل التشغيل

## المطلوب قبل البدء
- Node.js مثبت على جهازك → [تحميل من هنا](https://nodejs.org) (خذ الـ LTS)
- الـ JSON file بتاع الـ Service Account
- Google Sheet جديد (Sheet) وأخذ الـ ID من الـ URL

---

## خطوات التشغيل (3 بس)

### الخطوة 1 — ابعت ملف `.env.local`

في نفس الـ folder بتاع المشروع، ابعت ملف اسمه `.env.local` (مش `.env.local.example`)
وحط فيه:

```
GOOGLE_CLIENT_EMAIL=الـ client_email من الـ JSON
GOOGLE_PRIVATE_KEY="الـ private_key من الـ JSON كاملاً"
GOOGLE_SHEET_ID=الـ ID من URL الـ Sheet
```

**إزاي تلاقي الـ ID؟**
افتح الـ Google Sheet → انظر الـ URL:
`https://docs.google.com/spreadsheets/d/[ الـ ID هنا ]/edit`

---

### الخطوة 2 — شارك الـ Sheet مع الـ Service Account

1. افتح الـ Google Sheet
2. اضغط **Share** (المشاركة)
3. أضف الـ `client_email` من الـ JSON
4. اديه صلاحية **Editor** (محرر)
5. اضغط Send

---

### الخطوة 3 — شغل المشروع

افتح الـ Terminal في الـ folder واكتب:

```bash
npm install
npm run dev
```

افتح المتصفح على: **http://localhost:3000**

---

## ملاحظات
- الـ Headers في الـ Sheet بتتعمل أوتوماتيك
- كل add/edit/delete بيتحفظ مباشرة في الـ Google Sheet
- البيانات بتتحدث كل 30 ثانية أوتوماتيك
