const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
app.use(cors());
app.use(express.json());

// ====== EDIT THESE ======
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Princess777",
  database: "legal_case_system", // must match the DB created by your .sql file
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // returns DATE as '2026-01-10' (avoids timezone shift bug)
});
// ========================

// Helper: run a SELECT and return rows
const q = (sql, params = []) => pool.query(sql, params).then(([rows]) => rows);

// Wrap async routes so errors return JSON instead of crashing
const wrap = (fn) => (req, res) =>
  fn(req, res).catch((e) => {
    console.error(e);
    res.status(500).json({ error: e.sqlMessage || e.message });
  });

app.get("/api/health", wrap(async (req, res) => {
  const [r] = await q("SELECT DATABASE() AS db, (SELECT COUNT(*) FROM CLIENT) AS clients");
  res.json(r);
}));

app.get("/api/clients", wrap(async (req, res) => {
  res.json(await q(
    "SELECT c.*, count_cases_for_client(c.client_id) AS total_cases FROM CLIENT c ORDER BY client_id"
  ));
}));

app.get("/api/lawyers", wrap(async (req, res) => {
  res.json(await q("SELECT * FROM LAWYER ORDER BY lawyer_id"));
}));

app.get("/api/cases", wrap(async (req, res) => {
  res.json(await q(
    `SELECT cd.case_id, cd.case_type, cd.filing_date, cd.status, cd.client_id,
            c.name AS client_name,
            GROUP_CONCAT(l.name SEPARATOR ', ') AS lawyers
     FROM CASE_DETAILS cd
     JOIN CLIENT c ON cd.client_id = c.client_id
     LEFT JOIN CASE_LAWYER cl ON cd.case_id = cl.case_id
     LEFT JOIN LAWYER l ON cl.lawyer_id = l.lawyer_id
     GROUP BY cd.case_id, cd.case_type, cd.filing_date, cd.status, cd.client_id, c.name
     ORDER BY cd.case_id`
  ));
}));

app.get("/api/witnesses", wrap(async (req, res) => {
  res.json(await q(
    `SELECT w.witness_id, w.name, w.contact_info, w.testimony,
            GROUP_CONCAT(cw.case_id SEPARATOR ', ') AS case_ids
     FROM WITNESS w LEFT JOIN CASE_WITNESS cw ON w.witness_id = cw.witness_id
     GROUP BY w.witness_id, w.name, w.contact_info, w.testimony
     ORDER BY w.witness_id`
  ));
}));

app.get("/api/evidence", wrap(async (req, res) => {
  res.json(await q("SELECT * FROM EVIDENCE ORDER BY evidence_id"));
}));

app.get("/api/hearings", wrap(async (req, res) => {
  res.json(await q(
    `SELECT ch.hearing_id, ch.date, ch.time, ch.court_location, ch.case_id,
            cd.case_type, c.name AS client_name
     FROM COURT_HEARING ch
     JOIN CASE_DETAILS cd ON ch.case_id = cd.case_id
     JOIN CLIENT c ON cd.client_id = c.client_id
     ORDER BY ch.date`
  ));
}));

app.get("/api/audit", wrap(async (req, res) => {
  res.json(await q("SELECT * FROM AUDIT_LOG ORDER BY log_id DESC"));
}));

// Uses stored procedure get_case_summary (returns 3 result sets)
app.get("/api/cases/:id/summary", wrap(async (req, res) => {
  const [results] = await pool.query("CALL get_case_summary(?)", [req.params.id]);
  res.json({ info: results[0][0] || null, lawyers: results[1], hearings: results[2] });
}));

// Uses stored procedure add_new_case
app.post("/api/cases", wrap(async (req, res) => {
  const { case_type, filing_date, client_id } = req.body;
  const [results] = await pool.query("CALL add_new_case(?,?,?)", [case_type, filing_date, client_id]);
  res.json(results[0][0]);
}));

// Uses stored procedure assign_lawyer
app.post("/api/cases/:id/assign", wrap(async (req, res) => {
  const [results] = await pool.query("CALL assign_lawyer(?,?)", [req.params.id, req.body.lawyer_id]);
  res.json(results[0][0]);
}));

// Uses stored procedure close_case
app.put("/api/cases/:id/close", wrap(async (req, res) => {
  const [results] = await pool.query("CALL close_case(?)", [req.params.id]);
  res.json(results[0][0]);
}));

const PORT = 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));