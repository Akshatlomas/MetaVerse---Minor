import { generateAssistantReply } from '../services/aiProvider.js';
import * as locationService from '../services/locationService.js';
import { isDbConnected } from '../config/db.js';
import ChatMessage from '../models/ChatMessage.js';

export async function askAssistant(req, res, next) {
  try {
    const { message, context } = req.body;
    const sessionId = req.headers['x-session-id'] || 'anonymous';

    const locations = await locationService.getAllLocations();
    const result = await generateAssistantReply(message, { locations, ...context });

    if (isDbConnected()) {
      try {
        await ChatMessage.create([
          { sessionId, role: 'user', text: message },
          { sessionId, role: 'assistant', text: result.reply, action: result.action }
        ]);
      } catch (persistErr) {
        console.warn('[assistant] failed to persist chat history:', persistErr.message);
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
}
