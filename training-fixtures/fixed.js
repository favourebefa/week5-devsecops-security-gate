// Clean comparison fixture for training.
const JWT_SECRET = process.env.JWT_SECRET;

app.get("/api/search", async (req, res) => {
  if (!req.query.q || typeof req.query.q !== "string") {
    return res.status(400).json({ error: "q is required" });
  }

  const term = req.query.q.trim();

  if (term.length > 100) {
    return res.status(400).json({ error: "query too long" });
  }

  const query = "SELECT id, name FROM products WHERE name LIKE $1";
  const rows = await db.query(query, [`%${term}%`]);

  res.json({ results: rows });
});