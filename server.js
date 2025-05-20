const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// القيم الافتراضية في قاعدة البيانات
db.defaults({ users: [], transfers: [], wallets: {}, visits: [] }).write();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// الصفحة الرئيسية - تأكيد أن الـ API شغالة
app.get("/", (req, res) => {
  res.send("API شغالة تمام ✅");
});


// حذف مستخدم بالـ id
app.delete("/api/users/:id", (req, res) => {
  const userId = Number(req.params.id);

  const userExists = db.get("users").find({ id: userId }).value();
  if (!userExists) {
    return res.sendStatus(404); // مش موجود
  }

  db.get("users").remove({ id: userId }).write();

  res.sendStatus(204); // No Content - تم الحذف بنجاح بدون رد نصي
});

// حفظ بيانات التحويل
// app.post("/api/transfers", (req, res) => {
//   const { number, amount } = req.body;

//   if (!number || !amount) {
//     return res.status(400);
//   }

//   db.get("transfers")
//     .push({ id: Date.now(), number, amount })
//     .write();

//   res.status(201);
// });
app.post("/api/transfers", (req, res) => {
  const { number, amount, method } = req.body;          // ← أضف method

  if (!number || !amount || !method) {
    return res.status(400).json({ message: "بيانات ناقصة" });
  }

  const newTransfer = { id: Date.now(), number, amount: Number(amount), method };
  db.get("transfers").push(newTransfer).write();

  res.status(201).json({ success: true, transfer: newTransfer });
});

// تحديث أرقام المحافظ
app.post("/api/wallets", (req, res) => {
  const { vodafone, orange, etisalat, instapay } = req.body;

  db.set("wallets", {
    vodafone: vodafone || "01065217720",
    orange: orange || "01226868401",
    etisalat: etisalat || "01144065913",
    instapay: instapay || "mohamed.osamaa",
  }).write();

  res.json({ message: "تم تحديث أرقام المحافظ" });
});

// استرجاع بيانات لوحة التحكم (المستخدمين، التحويلات، المحافظ، الزيارات)
app.get("/api/dashboard", (req, res) => {
  const users = db.get("users").value();
  const transfers = db.get("transfers").value();
  const wallets = db.get("wallets").value();
  const visits = db.get("visits").value();

  res.json({ users, transfers, wallets, visits });
});

app.listen(port, () => {
  console.log(`السيرفر شغال على http://localhost:${port}`);
});
