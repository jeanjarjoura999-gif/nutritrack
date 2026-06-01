module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { messages } = req.body;
    const API_KEY = process.env.ANTHROPIC_API_KEY || "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";
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1000,
        messages
      })
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch(e) {
    res.status(500).json({ error: { message: e.message } });
  }
}
