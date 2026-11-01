import { api } from './api.js';
import { LOCATIONS, searchLocations, getLocationById } from '../data/locations.js';

/**
 * askAssistant
 * Communicates with backend /api/assistant endpoint. If backend is not
 * reachable, falls back seamlessly to local knowledge base.
 */
export async function askAssistant(message) {
  try {
    const result = await api.askAssistant(message, { locations: LOCATIONS.map((l) => l.id) });
    return result;
  } catch (err) {
    return localFallback(message);
  }
}

function localFallback(message) {
  const text = (message || '').toLowerCase().trim();

  // Navigation intents
  const navMatch = text.match(/(?:take me to|navigate to|go to|directions to|route to|walk to)\s+(.+)/i);
  if (navMatch) {
    const query = navMatch[1].replace(/the\s+/gi, '').replace(/[?.!]/g, '').trim();
    const [match] = searchLocations(query);
    if (match) {
      return {
        reply: `Plotting A* navigation route to ${match.name}. Follow the illuminated golden pathway on campus!`,
        action: { action: 'navigate', destination: match.id }
      };
    }
  }

  // Where is inquiries
  const whereMatch = text.match(/(?:where (?:is|are|can i find)|how (?:do i reach|to reach))\s+(?:the\s+)?(.+)/i);
  if (whereMatch) {
    const query = whereMatch[1].replace(/[?.!]/g, '').trim();
    const [match] = searchLocations(query);
    if (match) {
      return {
        reply: `${match.name} is highlighted on your map. ${match.description}`,
        action: { action: 'show_location', location: match.id }
      };
    }
  }

  // Study / Library
  if (text.includes('study') || text.includes('quiet') || text.includes('library') || text.includes('book')) {
    const lib = getLocationById('central-library');
    return {
      reply: `Dr. APJ Abdul Kalam Central Library is the ideal study space with air-conditioned reading halls and IEEE digital access. Open ${lib.hours}.`,
      action: { action: 'show_location', location: 'central-library' }
    };
  }

  // Food / Cafeteria
  if (text.includes('food') || text.includes('eat') || text.includes('canteen') || text.includes('cafeteria') || text.includes('coffee') || text.includes('nescafe')) {
    const food = getLocationById('food-court');
    return {
      reply: `Campus Cafeteria & Food Court offers hot meals, fresh fruit juices, and a Nescafe kiosk. Open ${food.hours}.`,
      action: { action: 'show_location', location: 'food-court' }
    };
  }

  // Hostels
  if (text.includes('hostel') || text.includes('dorm') || text.includes('residence')) {
    if (text.includes('girl') || text.includes('women')) {
      return {
        reply: `Sarojini Naidu Girls' Hostel is located in the north-east residential zone with 24/7 security.`,
        action: { action: 'show_location', location: 'hostel-girls' }
      };
    }
    return {
      reply: `IIIT Bhopal features Swami Vivekananda Boys' Hostel (north-west) and Sarojini Naidu Girls' Hostel (north-east).`,
      action: { action: 'show_location', location: 'hostel-boys' }
    };
  }

  // Computer Science / Coding
  if (text.includes('cse') || text.includes('computer') || text.includes('coding') || text.includes('lab') || text.includes('gpu')) {
    return {
      reply: `The Department of Computer Science & IT (CCF) houses GPU deep learning workstations, networking testbeds, and coding labs.`,
      action: { action: 'show_location', location: 'cse-it-block' }
    };
  }

  // Sports
  if (text.includes('sport') || text.includes('cricket') || text.includes('football') || text.includes('basketball') || text.includes('badminton') || text.includes('gym')) {
    return {
      reply: `The Sports Complex includes a cricket/football field, floodlit basketball court, badminton hall, and gymnasium.`,
      action: { action: 'show_location', location: 'sports-complex' }
    };
  }

  // About College
  if (text.includes('about') || text.includes('iiit') || text.includes('bhopal') || text.includes('college')) {
    return {
      reply: `IIIT Bhopal is an Institute of National Importance established in 2017 by MoE, Government of India, offering B.Tech in CSE, IT, and ECE.`,
      action: null
    };
  }

  // Exploration
  if (text.includes('explore') || text.includes('what can i find') || text.includes('list') || text.includes('places')) {
    const names = LOCATIONS.slice(0, 6).map((l) => l.name).join(', ');
    return {
      reply: `Key places to explore: ${names}, and more! Ask me to take you to any of them.`,
      action: { action: 'search', query: '' }
    };
  }

  const [fuzzy] = searchLocations(text);
  if (fuzzy) {
    return {
      reply: `Here is ${fuzzy.name}: ${fuzzy.description}`,
      action: { action: 'show_location', location: fuzzy.id }
    };
  }

  return {
    reply: `I can help you navigate the IIIT Bhopal campus. Try asking:
• "Where is the library?"
• "Take me to the CSE labs"
• "Where can I eat?"
• "Show me sports facilities"`,
    action: null
  };
}
