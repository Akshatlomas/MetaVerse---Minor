/**
 * mockProvider.js
 * -----------------------------------------------------------------------
 * Free, deterministic, zero-cost AI provider for IIIT Bhopal Metaverse.
 * Operates without external API keys or network calls.
 *
 * Implements intent classification, keyword extraction, and dataset
 * retrieval from the centralized IIIT Bhopal location records.
 * Returns structured actions to drive the Phaser game canvas and UI.
 * -----------------------------------------------------------------------
 */

export async function generateReply(message, { locations = [] }) {
  const text = (message || '').toLowerCase().trim();

  const findByQuery = (q) => {
    const cleanQ = q.toLowerCase().trim();
    if (!cleanQ) return null;
    return locations.find((loc) => {
      const matchName = loc.name.toLowerCase().includes(cleanQ);
      const matchType = loc.type.toLowerCase().includes(cleanQ);
      const matchId = loc.id.toLowerCase().includes(cleanQ);
      const matchKeywords = (loc.keywords || []).some((k) => k.toLowerCase().includes(cleanQ));
      return matchName || matchType || matchId || matchKeywords;
    });
  };

  // 1. Navigation / Direction intent
  const navRegex = /(?:take me to|navigate to|go to|directions to|route to|lead me to|walk to|find way to|show route to)\s+(.+)/i;
  const navMatch = text.match(navRegex);
  if (navMatch) {
    const query = navMatch[1].replace(/the\s+/gi, '').replace(/[?.!]/g, '').trim();
    const match = findByQuery(query);
    if (match) {
      return {
        reply: `Plotting A* navigation route to ${match.name}. Follow the illuminated golden pathway on campus!`,
        action: { action: 'navigate', destination: match.id }
      };
    }
  }

  // Direct keyword "navigate [place]" or "directions"
  if (text.startsWith('navigate ') || text.startsWith('route ')) {
    const query = text.replace(/^(navigate|route)\s+/i, '').replace(/the\s+/i, '').trim();
    const match = findByQuery(query);
    if (match) {
      return {
        reply: `Route locked to ${match.name}. Distance and estimated walking time are calculated on your HUD.`,
        action: { action: 'navigate', destination: match.id }
      };
    }
  }

  // 2. Location inquiry: "Where is..." / "How to find..."
  const whereRegex = /(?:where (?:is|are|can i find)|how (?:do i reach|to reach|can i get to)|look for)\s+(?:the\s+)?(.+)/i;
  const whereMatch = text.match(whereRegex);
  if (whereMatch) {
    const query = whereMatch[1].replace(/[?.!]/g, '').trim();
    const match = findByQuery(query);
    if (match) {
      return {
        reply: `${match.name} is highlighted on your map. ${match.description} Operating hours: ${match.hours}.`,
        action: { action: 'show_location', location: match.id }
      };
    }
  }

  // Accessible Classrooms & Buildings Intent
  if (
    text.includes('classroom') ||
    text.includes('lecture hall') ||
    text.includes('lh-101') ||
    text.includes('lh101') ||
    text.includes('smart class') ||
    text.includes('tutorial') ||
    text.includes('accessible') ||
    text.includes('wheelchair') ||
    text.includes('ramp')
  ) {
    const lhc = findByQuery('lecture-hall-complex') || findByQuery('lecture');
    return {
      reply: `IIIT Bhopal features accessible smart classrooms in the Lecture Hall Complex (LHC Block A), Aryabhata Tutorial Block (Block B), and CCF Block! They are equipped with 1:12 wheelchair ramps, 4K interactive smart boards, audio induction loops, and dedicated front-row accessible stations. Follow the golden pathway to explore them!`,
      action: lhc ? { action: 'navigate', destination: lhc.id } : null
    };
  }

  // 3. Study / Library inquiries
  if (text.includes('study') || text.includes('quiet') || text.includes('reading') || text.includes('book') || text.includes('library')) {
    const lib = findByQuery('library');
    if (lib) {
      return {
        reply: `The best study spot is the ${lib.name}! It features air-conditioned reading halls, IEEE digital access, and 15,000+ textbooks. Open ${lib.hours}.`,
        action: { action: 'show_location', location: lib.id }
      };
    }
  }

  // 4. Food / Dining inquiries
  if (text.includes('food') || text.includes('eat') || text.includes('hungry') || text.includes('canteen') || text.includes('cafeteria') || text.includes('coffee') || text.includes('nescafe') || text.includes('lunch')) {
    const food = findByQuery('food');
    if (food) {
      return {
        reply: `You can grab meals and refreshments at the ${food.name}! It features the main student canteen, juice counter, and a Nescafe kiosk. Open ${food.hours}.`,
        action: { action: 'show_location', location: food.id }
      };
    }
  }

  // 5. Hostels / Accommodation
  if (text.includes('hostel') || text.includes('dorm') || text.includes('room') || text.includes('stay') || text.includes('residence')) {
    if (text.includes('girl') || text.includes('women') || text.includes('female')) {
      const gh = findByQuery('girls');
      return {
        reply: `Sarojini Naidu Girls' Hostel is located in the north-east residential zone with 24/7 security and Wi-Fi.`,
        action: gh ? { action: 'show_location', location: gh.id } : null
      };
    }
    const bh = findByQuery('boys');
    return {
      reply: `IIIT Bhopal features separate on-campus residential hostels: Swami Vivekananda Boys' Hostel (north-west) and Sarojini Naidu Girls' Hostel (north-east).`,
      action: bh ? { action: 'show_location', location: bh.id } : null
    };
  }

  // 6. Labs / Coding / Computer Science / ECE
  if (text.includes('cse') || text.includes('computer') || text.includes('coding') || text.includes('lab') || text.includes('gpu') || text.includes('ai')) {
    const cse = findByQuery('cse');
    if (cse) {
      return {
        reply: `The Department of Computer Science & IT (CCF) hosts advanced AI & Deep Learning Labs, high-performance computing clusters, and coding labs. Open ${cse.hours}.`,
        action: { action: 'show_location', location: cse.id }
      };
    }
  }

  if (text.includes('ece') || text.includes('electronics') || text.includes('robotics') || text.includes('iot') || text.includes('vlsi')) {
    const ece = findByQuery('ece');
    if (ece) {
      return {
        reply: `The Department of Electronics & Communication (ECE) houses VLSI Design Suites, Embedded Systems & IoT testbeds, and the Robotics Arena. Open ${ece.hours}.`,
        action: { action: 'show_location', location: ece.id }
      };
    }
  }

  // 7. Sports & Fitness
  if (text.includes('sport') || text.includes('gym') || text.includes('cricket') || text.includes('football') || text.includes('basketball') || text.includes('badminton') || text.includes('workout')) {
    const sports = findByQuery('sports');
    if (sports) {
      return {
        reply: `Head over to the ${sports.name}! Facilities include cricket/football turf, floodlit basketball court, badminton courts, and student fitness gym. Open ${sports.hours}.`,
        action: { action: 'show_location', location: sports.id }
      };
    }
  }

  // 8. Placements & Internships
  if (text.includes('placement') || text.includes('job') || text.includes('internship') || text.includes('recruitment') || text.includes('package') || text.includes('company')) {
    const tp = findByQuery('placement');
    if (tp) {
      return {
        reply: `The Training & Placement Cell (T&P Centre) coordinates campus recruitment, corporate interviews, and internship drives for CSE, IT, and ECE students.`,
        action: { action: 'show_location', location: tp.id }
      };
    }
  }

  // 9. Startup & Innovation
  if (text.includes('startup') || text.includes('innovation') || text.includes('hackathon') || text.includes('incubation') || text.includes('maker') || text.includes('3d print')) {
    const iiec = findByQuery('innovation');
    if (iiec) {
      return {
        reply: `The Innovation & Incubation Centre (IIEC) supports student startups, rapid 3D prototyping, coding clubs, and hackathon teams.`,
        action: { action: 'show_location', location: iiec.id }
      };
    }
  }

  // 10. General College Information
  if (text.includes('about iiit') || text.includes('what is iiit bhopal') || text.includes('college') || text.includes('institute')) {
    return {
      reply: `Indian Institute of Information Technology Bhopal (IIIT Bhopal) is an Institute of National Importance established in 2017 by MoE, Government of India. It offers premier B.Tech programs in Computer Science & Engineering, Information Technology, and Electronics & Communication Engineering.`,
      action: null
    };
  }

  // 11. Campus exploration list
  if (text.includes('what can i find') || text.includes('what is on campus') || text.includes('list') || text.includes('explore') || text.includes('buildings') || text.includes('places')) {
    const list = locations.slice(0, 7).map((l) => l.name).join(', ');
    return {
      reply: `Key landmarks you can explore: ${list}, and more! Click any building or type "Take me to [place]" to navigate.`,
      action: { action: 'search', query: '' }
    };
  }

  // 12. How to play / controls
  if (text.includes('how to play') || text.includes('controls') || text.includes('movement') || text.includes('how to move')) {
    return {
      reply: `Controls: Use W/A/S/D or Arrow keys to walk, hold Shift to sprint, press E near buildings/NPCs to interact, press Esc for menu, or simply click anywhere on the ground to walk there!`,
      action: null
    };
  }

  // 13. Fuzzy match fallback
  const fuzzy = findByQuery(text);
  if (fuzzy) {
    return {
      reply: `Found ${fuzzy.name}: ${fuzzy.description} Would you like directions?`,
      action: { action: 'show_location', location: fuzzy.id }
    };
  }

  // 14. Default fallback with helpful suggestions
  return {
    reply: `I can guide you anywhere on campus! Try asking:
• "Take me to Central Library"
• "Where is the Computer Science Lab?"
• "Where can I get food?"
• "Show me sports facilities"
• "Tell me about IIIT Bhopal"`,
    action: null
  };
}
