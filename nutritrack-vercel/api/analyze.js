module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const body = req.body;
    const action = body.action;
    const SUPABASE_URL = "https://nrmwgpochdtslsewhvdw.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybXdncG9jaGR0c2xzZXdodmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDE4MzMsImV4cCI6MjA5NTg3NzgzM30.fhVzmUezDsBy_OdMt5zIH25LIGPHEVDBBVskHVZojq8";

    // ── Save history to Supabase ──────────────────────────────────────────
    if (action === "save") {
      const res2 = await fetch(`${SUPABASE_URL}/rest/v1/history`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates,return=minimal"
        },
        body: JSON.stringify({ id: 1, data: body.history })
      });
      console.log("Supabase save status:", res2.status);
      return res.status(200).json({ ok: true, status: res2.status });
    }

    // ── Load history from Supabase ────────────────────────────────────────
    if (action === "load") {
      const res2 = await fetch(`${SUPABASE_URL}/rest/v1/history?id=eq.1&select=data`, {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`
        }
      });
      const rows = await res2.json();
      console.log("Supabase load status:", res2.status, "rows:", rows.length);
      const data = (rows && rows[0] && rows[0].data) ? rows[0].data : {};
      return res.status(200).json({ history: data });
    }

    // ── Analyze meal with Claude ──────────────────────────────────────────
    const API_KEY = process.env.ANTHROPIC_API_KEY;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: body.messages
      })
    });
    const data = await response.json();
    return res.status(200).json(data);

  } catch(e) {
    console.error("Function error:", e.message);
    return res.status(500).json({ error: { message: e.message } });
  }
}
