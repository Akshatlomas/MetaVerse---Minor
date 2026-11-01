/**
 * anthropicProvider
 * Calls the Anthropic Messages API directly over HTTPS (no SDK
 * dependency, to keep the project lightweight). Requires
 * ANTHROPIC_API_KEY to be set in server/.env - never exposed to the
 * client.
 *
 * The model is instructed to reply with strict JSON so the campus map
 * can act on structured commands, e.g.
 *   { "reply": "...", "action": { "action": "navigate", "destination": "library" } }
 */

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

function buildSystemPrompt(locations) {
  const locationList = locations
    .map((l) => `- id: "${l.id}", name: "${l.name}", type: "${l.type}"`)
    .join('\n');

  return `You are the AI campus assistant for a browser-based IIIT Bhopal campus map.
You know about the following locations:
${locationList}

Respond to the user's question about the campus. You MUST reply with ONLY a
single JSON object, no markdown, no code fences, in exactly this shape:
{"reply": "<short, friendly reply text>", "action": <action object or null>}

Valid action objects:
{"action": "navigate", "destination": "<location id>"}
{"action": "show_location", "location": "<location id>"}
{"action": "search", "query": "<free text>"}

Use "navigate" when the user wants to go somewhere, "show_location" when
they just want to see/know where something is, "search" when the request
is broader than one place, and null when no map action applies. Only use
location ids from the list above.`;
}

export async function generateReply(message, { locations }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-sonnet-4-6',
      max_tokens: 400,
      system: buildSystemPrompt(locations),
      messages: [{ role: 'user', content: message }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content?.find((b) => b.type === 'text');
  const raw = textBlock?.text?.trim() || '{}';

  const cleaned = raw.replace(/^```json/i, '').replace(/```$/, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      reply: parsed.reply || "I'm not sure how to help with that.",
      action: parsed.action || null
    };
  } catch {
    // Model didn't return clean JSON - fall back to plain text reply.
    return { reply: raw, action: null };
  }
}
