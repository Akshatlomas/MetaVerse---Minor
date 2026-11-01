/**
 * geminiProvider.js
 * Calls Google Gemini REST API directly using standard fetch.
 * Reads GEMINI_API_KEY from environment variables.
 * Gracefully falls back if key is missing or request fails.
 */

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function buildPrompt(message, locations) {
  const locSummary = locations
    .map((l) => `- id: "${l.id}", name: "${l.name}", type: "${l.type}", hours: "${l.hours}"`)
    .join('\n');

  return `You are the virtual campus AI assistant for IIIT Bhopal Metaverse.
Campus Locations:
${locSummary}

User asked: "${message}"

Respond strictly as a JSON object (no markdown, no backticks, no code blocks):
{
  "reply": "<helpful, concise reply for student/visitor>",
  "action": <{"action": "navigate", "destination": "<id>"} OR {"action": "show_location", "location": "<id>"} OR {"action": "search", "query": "<string>"} OR null>
}`;
}

export async function generateReply(message, { locations = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment');
  }

  const url = `${GEMINI_ENDPOINT}?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(message, locations) }] }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
  const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      reply: parsed.reply || rawText,
      action: parsed.action || null
    };
  } catch {
    return { reply: rawText, action: null };
  }
}
