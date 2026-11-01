/**
 * openaiProvider.js
 * Calls OpenAI API directly via fetch.
 * Reads OPENAI_API_KEY from environment variables.
 */

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export async function generateReply(message, { locations = [] }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured in environment');
  }

  const locSummary = locations
    .map((l) => `- id: "${l.id}", name: "${l.name}", type: "${l.type}"`)
    .join('\n');

  const system = `You are the AI campus guide for IIIT Bhopal Metaverse.
Locations:
${locSummary}

Reply ONLY with valid JSON in this structure:
{"reply": "<response>", "action": <{"action": "navigate", "destination": "<id>"} OR {"action": "show_location", "location": "<id>"} OR null>}`;

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: message }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || '{}';

  try {
    const parsed = JSON.parse(raw);
    return {
      reply: parsed.reply || raw,
      action: parsed.action || null
    };
  } catch {
    return { reply: raw, action: null };
  }
}
