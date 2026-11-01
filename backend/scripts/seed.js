import 'dotenv/config';
import mongoose from 'mongoose';
import Location from '../models/Location.js';
import User from '../models/User.js';
import NPC from '../models/NPC.js';
import { MOCK_LOCATIONS } from '../data/mockLocations.js';

const SEED_NPCS = [
  {
    id: 'guide-aryan',
    name: 'Aryan Sharma',
    role: 'Senior Student Guide',
    x: 640,
    y: 1180,
    dialogue: [
      'Welcome to IIIT Bhopal Metaverse! Walk around with WASD or arrow keys.',
      'Head north through the main entrance to reach the Academic & CCF blocks.',
      'You can search any building using the top search bar, or ask the AI Assistant!'
    ]
  },
  {
    id: 'prof-sharma',
    name: 'Dr. R.K. Sharma',
    role: 'Professor (CSE)',
    x: 360,
    y: 640,
    dialogue: [
      'Welcome to the Department of Computer Science & IT!',
      'Our CCF lab houses high-performance computing nodes for AI/ML and systems research.',
      'Always keep your code modular and your algorithms optimized!'
    ]
  },
  {
    id: 'lib-ananya',
    name: 'Dr. Ananya Verma',
    role: 'Head Librarian',
    x: 1220,
    y: 640,
    dialogue: [
      'Welcome to Dr. APJ Abdul Kalam Central Library.',
      'We provide access to IEEE Xplore, ACM Digital Library, and quiet reading halls.',
      'Books can be issued using your student identity card.'
    ]
  },
  {
    id: 'sports-vikram',
    name: 'Coach Vikram',
    role: 'Sports Officer',
    x: 340,
    y: 940,
    dialogue: [
      'Welcome to the Sports Complex!',
      'We have cricket, football, basketball, and badminton facilities.',
      'Physical fitness is just as important as debugging code!'
    ]
  }
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/iiit_bhopal_metaverse';
  console.log(`[seed] Connecting to MongoDB at ${uri}...`);

  try {
    await mongoose.connect(uri);
    console.log('[seed] Connected. Clearing existing collections...');

    await Location.deleteMany({});
    await User.deleteMany({});
    await NPC.deleteMany({});

    console.log(`[seed] Inserting ${MOCK_LOCATIONS.length} campus locations...`);
    await Location.insertMany(MOCK_LOCATIONS);

    console.log(`[seed] Inserting ${SEED_NPCS.length} NPCs...`);
    await NPC.insertMany(SEED_NPCS);

    console.log('[seed] Creating sample student user...');
    await User.create({
      name: 'BTech Student',
      email: 'student@iiitbhopal.ac.in',
      role: 'student',
      avatarConfig: {
        savedLocations: ['central-library', 'cse-it-block', 'food-court']
      }
    });

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
