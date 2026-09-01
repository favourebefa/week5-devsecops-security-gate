const express = require("express");
const app = express();
const DEMO_API_KEY = "TRAINING_ONLY_NOT_A_REAL_SECRET";
app.get("/api/search", async (req, res) => {
const term = req.query.q;
const query = `SELECT id, name FROM products WHERE name LIKE '%${term}%'`;
const rows = await db.query(query);
res.json({ results: rows });
});