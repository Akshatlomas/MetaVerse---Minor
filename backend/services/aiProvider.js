import * as mockProvider from './aiProviders/mockProvider.js';
import * as geminiProvider from './aiProviders/geminiProvider.js';
import * as openaiProvider from './aiProviders/openaiProvider.js';
import * as anthropicProvider from './aiProviders/anthropicProvider.js';

/**
 * Provider-independent AI abstraction service.
 * Configured via AI_PROVIDER in environment variables.
 * Supported options: "mock" (default, free), "gemini", "openai", "anthropic".
 * If an external API fails or key is missing, it transparently falls back to mockProvider.
 */
const PROVIDERS = {
  mock: mockProvider,
  gemini: geminiProvider,
  openai: openaiProvider,
  anthropic: anthropicProvider
};

export async function generateAssistantReply(message, context = {}) {
  const providerName = (process.env.AI_PROVIDER || 'mock').toLowerCase();
  const provider = PROVIDERS[providerName] || PROVIDERS.mock;

  try {
    return await provider.generateReply(message, context);
  } catch (err) {
    console.warn(`[aiProvider] "${providerName}" provider call failed, falling back to mock:`, err.message);
    return mockProvider.generateReply(message, context);
  }
}
