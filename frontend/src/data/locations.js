/**
 * locations.js
 * -----------------------------------------------------------------------
 * Centralized dataset for every campus location in IIIT Bhopal Metaverse.
 * Includes verified academic departments, computing facilities (CCF),
 * newly added accessible Smart Lecture Hall Complex (LHC), Tutorial
 * Complexes, accessibility standards (PwD / Wheelchair friendly),
 * and interactive classroom datasets.
 * -----------------------------------------------------------------------
 */

export const LOCATION_TYPES = {
  ACADEMIC: 'academic',
  CLASSROOM: 'classroom',
  ADMIN: 'admin',
  RESEARCH: 'research',
  HOSTEL: 'hostel',
  FOOD: 'food',
  SPORTS: 'sports',
  ENTRANCE: 'entrance',
  OTHER: 'other'
};

export const LOCATION_ICONS = {
  [LOCATION_TYPES.ACADEMIC]: 'GraduationCap',
  [LOCATION_TYPES.CLASSROOM]: 'BookOpen',
  [LOCATION_TYPES.ADMIN]: 'Building2',
  [LOCATION_TYPES.RESEARCH]: 'Cpu',
  [LOCATION_TYPES.HOSTEL]: 'Home',
  [LOCATION_TYPES.FOOD]: 'UtensilsCrossed',
  [LOCATION_TYPES.SPORTS]: 'Trophy',
  [LOCATION_TYPES.ENTRANCE]: 'DoorOpen',
  [LOCATION_TYPES.OTHER]: 'TreePine'
};

export const LOCATION_COLORS = {
  [LOCATION_TYPES.ACADEMIC]: 0x3b82f6,  // Blue
  [LOCATION_TYPES.CLASSROOM]: 0x06b6d4, // Cyan / Teal
  [LOCATION_TYPES.ADMIN]: 0xd97706,     // Amber / Gold
  [LOCATION_TYPES.RESEARCH]: 0x8b5cf6,  // Purple
  [LOCATION_TYPES.HOSTEL]: 0x10b981,    // Emerald Green
  [LOCATION_TYPES.FOOD]: 0xf97316,      // Orange
  [LOCATION_TYPES.SPORTS]: 0xef4444,    // Red / Crimson
  [LOCATION_TYPES.ENTRANCE]: 0x64748b,  // Slate
  [LOCATION_TYPES.OTHER]: 0x22c55e      // Green
};

export const LOCATIONS = [
  {
    id: 'main-gate',
    name: 'Main Campus Entrance Gate',
    type: LOCATION_TYPES.ENTRANCE,
    categoryName: 'Entrance & Security',
    x: 640,
    y: 1260,
    width: 140,
    height: 48,
    description:
      'The primary grand gateway to IIIT Bhopal. Features 24/7 security checkpoint, automated boom barrier, visitor registration desk, and campus information directory.',
    services: ['Security checkpoint', 'Visitor entry pass', 'Campus map directory', 'Parking access', 'Wheelchair Assistance Desk'],
    hours: 'Open 24 Hours (Security Active)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: false,
      tactilePaving: true,
      brailleSignage: true,
      details: 'Step-free entrance gateway, security assistance for persons with disabilities, tactile pedestrian crossing.'
    },
    keywords: ['entrance', 'gate', 'security', 'entry', 'exit', 'barrier', 'guard', 'parking']
  },
  {
    id: 'admin-academic-block',
    name: 'Main Administrative Complex',
    type: LOCATION_TYPES.ADMIN,
    categoryName: 'Administration',
    x: 640,
    y: 700,
    width: 320,
    height: 180,
    description:
      'The administrative headquarters housing the Director Secretariat, Office of the Dean (Academic & Student Welfare), Registrar Office, Examination Cell, and Accounts Section.',
    services: ["Director's Secretariat", "Dean's Office", 'Registrar Office', 'Examination Cell', 'Accounts & Fees Desk', 'Conference Hall', 'Ground Floor Helpdesk'],
    hours: '9:00 AM - 5:30 PM (Mon-Fri)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: true,
      tactilePaving: true,
      brailleSignage: true,
      accessibleRestrooms: true,
      details: 'Dual gentle-slope wheelchair ramps with double handrails, automatic glass doors, central passenger elevator, low-counter student service desks.'
    },
    keywords: ['director', 'dean', 'admin', 'registrar', 'office', 'fees', 'exam', 'certificates', 'scholarship', 'accessible']
  },
  {
    id: 'cse-it-block',
    name: 'Department of Computer Science & IT (CCF)',
    type: LOCATION_TYPES.ACADEMIC,
    categoryName: 'Academic & Labs',
    x: 320,
    y: 700,
    width: 220,
    height: 180,
    description:
      'Central Computing Facility (CCF) and core academic home for B.Tech CSE and IT students. Equipped with high-performance workstations, GPU computing clusters, and specialized coding laboratories.',
    services: ['AI & Deep Learning Lab', 'Networks & Security Lab', 'Software Engineering Lab', 'Central Server Room', 'Smart Coding Studio 104', 'Lecture Hall 108'],
    hours: '8:00 AM - 8:30 PM (Labs 24/7 during projects)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: true,
      tactilePaving: true,
      brailleSignage: true,
      audioInductionLoop: true,
      accessibleRestrooms: true,
      details: 'Dedicated ground-floor entrance ramp, motorized height-adjustable coding workstations, screen-reader ready terminals, wide 40-inch doorways.'
    },
    classrooms: [
      {
        id: 'ccf-lab-104',
        name: 'AI & Deep Learning Studio (CCF 104)',
        floor: 'Ground Floor',
        capacity: 65,
        type: 'High-Performance Computing Lab',
        accessible: true,
        accessibilityFeatures: ['Motorized Height-Adjustable Desks', 'Braille Keyboard Access', 'Screen Reader Ready'],
        currentClass: {
          code: 'CS305',
          subject: 'Artificial Intelligence & Machine Learning Practical',
          faculty: 'Dr. R.K. Sharma',
          time: '02:00 PM - 04:00 PM',
          topic: 'Convolutional Neural Networks & Model Optimization'
        },
        slides: [
          { title: 'Deep Learning Cluster: GPU Pipeline', content: 'Distributed training across 4x NVIDIA A100 Tensor Core GPUs with PyTorch DDP.' },
          { title: 'Convolutional Kernel Operations', content: 'Feature map extraction using 3x3 receptive fields with Batch Normalization and ReLU activation.' }
        ],
        equipment: ['65x High-Performance Workstations', 'NVIDIA A100 GPU Cluster', '85" 4K Smart Presentation Display']
      },
      {
        id: 'cse-lh-108',
        name: 'Advanced Algorithms Lecture Studio (LH-108)',
        floor: 'Ground Floor',
        capacity: 90,
        type: 'Smart Lecture Hall',
        accessible: true,
        accessibilityFeatures: ['Ramped Entrance', 'Front-Row Wheelchair Station', 'Hearing Loop'],
        currentClass: {
          code: 'CS301',
          subject: 'Design & Analysis of Algorithms',
          faculty: 'Dr. S. K. Gupta',
          time: '10:00 AM - 11:30 AM',
          topic: 'Greedy Choice Property & Minimum Spanning Trees'
        },
        slides: [
          { title: 'Kruskal vs Prim Algorithm Complexity', content: 'Kruskal: O(E log E) using Disjoint Set Union (Union-Find).\nPrim: O(E + V log V) using Fibonacci Heaps.' }
        ],
        equipment: ['Interactive Digital Whiteboard', 'Auto-Tracking PTZ Camera', 'Acoustic Wall Panels']
      }
    ],
    keywords: ['cse', 'computer science', 'it', 'information technology', 'labs', 'coding', 'gpu', 'ai', 'programming', 'lecture', 'accessible']
  },
  {
    id: 'ece-block',
    name: 'Department of Electronics & Communication (ECE)',
    type: LOCATION_TYPES.ACADEMIC,
    categoryName: 'Academic & Labs',
    x: 960,
    y: 700,
    width: 220,
    height: 180,
    description:
      'Specialized academic building for Electronics & Communication Engineering. Features state-of-the-art hardware design suites, IoT testbeds, and signal analysis stations.',
    services: ['VLSI Design Suite', 'Embedded Systems & IoT Lab', 'Signal Processing Lab', 'Robotics Arena', 'ECE Seminar Hall 201'],
    hours: '8:00 AM - 8:00 PM',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: true,
      tactilePaving: true,
      brailleSignage: true,
      accessibleRestrooms: true,
      details: 'Gentle grade exterior ramp, wheelchair accessible laboratory workbenches with low-reach power strips, tactile floor guidance lines.'
    },
    classrooms: [
      {
        id: 'ece-studio-201',
        name: 'Embedded Systems & IoT Studio (Room 201)',
        floor: 'Ground Floor',
        capacity: 60,
        type: 'Hardware Design Classroom',
        accessible: true,
        accessibilityFeatures: ['Low-Reach Hardware Testbenches', 'Wheelchair Clearance', 'Contrast Workstations'],
        currentClass: {
          code: 'EC304',
          subject: 'Microcontrollers & Embedded Systems',
          faculty: 'Dr. P. Deshmukh',
          time: '11:30 AM - 01:00 PM',
          topic: 'ARM Cortex-M4 Architecture & Real-Time Interrupts'
        },
        slides: [
          { title: 'ARM Cortex-M4 Nested Vectored Interrupt Controller', content: 'Deterministic low-latency interrupt handling with tail-chaining in 12 clock cycles.' }
        ],
        equipment: ['FPGA & Microcontroller Testbenches', 'Digital Oscilloscopes', 'Smart Interactive Screen']
      }
    ],
    keywords: ['ece', 'electronics', 'communication', 'vlsi', 'iot', 'robotics', 'circuits', 'hardware', 'embedded', 'accessible']
  },
  {
    id: 'lecture-hall-complex',
    name: 'Lecture Hall Complex & Smart Classrooms (LHC)',
    type: LOCATION_TYPES.CLASSROOM,
    categoryName: 'Smart Classrooms & Lecture Halls',
    x: 960,
    y: 450,
    width: 220,
    height: 140,
    description:
      'Flagship academic teaching complex at IIIT Bhopal. Houses tier-seated smart lecture theatres, interactive 4K digital whiteboards, dual motorized HD projection, and barrier-free universal wheelchair accessibility.',
    services: [
      'Smart Lecture Hall 101 (LH-101)',
      'Smart Lecture Hall 102 (LH-102)',
      'Smart Lecture Hall 103 (LH-103)',
      'Interactive Tutorial Room 1 (TR-1)',
      'Step-Free Wheelchair Ramps & Handrails',
      'Assistive Hearing Induction Loop'
    ],
    hours: '8:00 AM - 7:30 PM (Mon-Sat)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: true,
      tactilePaving: true,
      brailleSignage: true,
      audioInductionLoop: true,
      accessibleRestrooms: true,
      details: '100% barrier-free complex. Features dual exterior ramps, 42-inch automatic sliding doors, dedicated front-row wheelchair desks with charging outlets, and an audio induction loop system for hearing aids.'
    },
    classrooms: [
      {
        id: 'lh-101',
        name: 'Smart Lecture Hall 101 (LH-101)',
        floor: 'Ground Floor (Step-Free)',
        capacity: 120,
        type: 'Smart Lecture Theatre',
        accessible: true,
        accessibilityFeatures: ['Dual Wheelchair Ramps', 'Front-Row Accessible Desks', 'Audio Induction Loop', 'Tactile Floor Path'],
        currentClass: {
          code: 'CS301',
          subject: 'Design & Analysis of Algorithms',
          faculty: 'Dr. R.K. Sharma',
          time: '10:00 AM - 11:30 AM',
          topic: 'Dynamic Programming & Memoization Optimization'
        },
        slides: [
          { title: 'Dynamic Programming: Optimal Substructure', content: 'Bellman Principle: An optimal policy has the property that whatever the initial state, remaining decisions must constitute an optimal policy with regard to the state resulting from the first decision.' },
          { title: 'Memoization vs Tabulation Complexity', content: 'Top-down Memoization: Recursion with cache (O(N) time, O(N) stack space).\nBottom-up Tabulation: Iterative table computation (O(N) time, O(1) auxiliary space optimization).' },
          { title: 'Interactive Class Practice Problem', content: 'Problem: Longest Common Subsequence (LCS) for DNA sequence alignment.\nRecurrence: if X[i] == Y[j] -> 1 + LCS(i-1, j-1) else max(LCS(i-1, j), LCS(i, j-1)).' }
        ],
        equipment: ['86" 4K Smart Interactive Touch Board', 'Dual HD Motorized Projectors', 'Voice-Tracking Ceiling Mic Array', 'Audio Induction Loop Transceiver']
      },
      {
        id: 'lh-102',
        name: 'Smart Lecture Hall 102 (LH-102)',
        floor: 'Ground Floor (Step-Free)',
        capacity: 120,
        type: 'Smart Lecture Theatre',
        accessible: true,
        accessibilityFeatures: ['Wide Double Doors', 'Priority Wheelchair Seating', 'High-Contrast Screen Display', 'Assisted Listening'],
        currentClass: {
          code: 'EC302',
          subject: 'Digital Signal Processing',
          faculty: 'Dr. P. Deshmukh',
          time: '11:45 AM - 01:15 PM',
          topic: 'Fast Fourier Transform (FFT) & Decimation-in-Time'
        },
        slides: [
          { title: 'Radix-2 Cooley-Tukey FFT Algorithm', content: 'Reduces N-point Discrete Fourier Transform computation complexity from O(N^2) to O(N log2 N) using butterfly signal flow graphs.' },
          { title: 'Butterworth vs Chebyshev Filter Design', content: 'Butterworth: Maximally flat frequency response in passband.\nChebyshev Type I: Equiripple passband with sharper transition roll-off.' }
        ],
        equipment: ['Smart Touch Interactive Board', 'Acoustic Soundproofing Wall Panels', 'Wireless Clip-on Podium Microphone', 'Document Camera Visualizer']
      },
      {
        id: 'tr-1',
        name: 'Interactive Tutorial Room 1 (TR-1)',
        floor: 'Ground Floor',
        capacity: 45,
        type: 'Collaborative Tutorial Studio',
        accessible: true,
        accessibilityFeatures: ['Height-Adjustable Universal Tables', 'Step-Free Entrance', 'Wide Aisle Clearance'],
        currentClass: {
          code: 'IT304',
          subject: 'Database Systems & Query Optimization',
          faculty: 'Prof. Ananya Rao',
          time: '02:00 PM - 03:30 PM',
          topic: 'B+ Tree Indexing & Transaction Concurrency Control'
        },
        slides: [
          { title: 'B+ Tree Indexing Structure', content: 'All records stored at leaf level. High fan-out minimizes disk I/O seek operations for large-scale college database queries.' }
        ],
        equipment: ['Dual Digital Whiteboards', 'Collaborative Team Worktables', 'High-Speed Wi-Fi 6 Access Points']
      }
    ],
    keywords: ['lecture hall', 'lhc', 'smart classroom', 'lh101', 'lh-101', 'lh102', 'lh-102', 'classroom', 'class', 'lecture', 'tutorial', 'accessible', 'wheelchair', 'projector', 'smartboard']
  },
  {
    id: 'aryabhata-classroom-complex',
    name: 'Aryabhata Academic & Tutorial Complex (Block B)',
    type: LOCATION_TYPES.CLASSROOM,
    categoryName: 'Academic & Tutorial Block',
    x: 1260,
    y: 940,
    width: 200,
    height: 140,
    description:
      'Modern academic complex housing multipurpose seminar halls, smart tutorial classrooms (TR-201 to TR-204), and multimedia e-studios. Equipped with accessible ramps, tactile ground paths, and braille signage.',
    services: [
      'High-Tech Seminar Hall 1 (SH-1)',
      'Smart Tutorial Room 201 (TR-201)',
      'Multimedia E-Learning Studio',
      'Accessible Ramp & Handrails',
      'Tactile Navigation Paths',
      'Divyangjan Accessible Restrooms'
    ],
    hours: '8:00 AM - 7:00 PM (Mon-Sat)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: true,
      tactilePaving: true,
      brailleSignage: true,
      audioInductionLoop: true,
      accessibleRestrooms: true,
      details: 'Step-free ramp entry with safety side rails, ground-floor multipurpose seminar hall, wheelchair accessible podium and audience spots, Braille directional signs.'
    },
    classrooms: [
      {
        id: 'sh-1',
        name: 'High-Tech Seminar Hall 1 (SH-1)',
        floor: 'Ground Floor (Accessible)',
        capacity: 180,
        type: 'Auditorium & Seminar Hall',
        accessible: true,
        accessibilityFeatures: ['Dual Ramped Stage & Audience Aisles', 'Dedicated Wheelchair Row', 'Hearing Aid Induction Loop', 'Tactile Pathway'],
        currentClass: {
          code: 'SEMINAR',
          subject: 'Departmental Seminar & Research Colloquium',
          faculty: 'Invited Industry Expert & Faculty Panel',
          time: '03:00 PM - 05:00 PM',
          topic: 'Generative AI and Agentic Systems in Modern Cloud Infrastructure'
        },
        slides: [
          { title: 'Industry Seminar: Agentic AI Architectures', content: 'Autonomous agent design patterns: Reasoning loops, tool integration, context compaction, and self-correcting evaluation pipelines.' }
        ],
        equipment: ['Full-Width Laser Cinema Projector', 'JBL Professional Sound System', 'Gooseneck Accessible Podium Mic', 'Motorized Window Blinds']
      },
      {
        id: 'tr-201',
        name: 'Smart Tutorial Room 201 (TR-201)',
        floor: 'Ground Floor',
        capacity: 50,
        type: 'Interactive Tutorial Classroom',
        accessible: true,
        accessibilityFeatures: ['Wheelchair Friendly Desks', 'Accessible Whiteboard', 'Audio Visual Subtitles'],
        currentClass: {
          code: 'MA201',
          subject: 'Discrete Mathematics & Graph Theory',
          faculty: 'Dr. V. Saxena',
          time: '09:00 AM - 10:30 AM',
          topic: 'Graph Isomorphism and Dijkstra vs A* Shortest Paths'
        },
        slides: [
          { title: 'Heuristic Search in Graph Theory', content: 'A* algorithm guarantees optimality when the heuristic h(n) is admissible and consistent (monotonic).' }
        ],
        equipment: ['Interactive Touch Screen', 'Mobile Ergonomic Desks', 'Overhead Document Projector']
      }
    ],
    keywords: ['aryabhata', 'tutorial', 'seminar', 'seminar hall', 'sh1', 'tr201', 'classroom', 'class', 'lecture', 'accessible', 'wheelchair', 'ramp', 'smart classroom']
  },
  {
    id: 'central-library',
    name: 'Dr. APJ Abdul Kalam Central Library',
    type: LOCATION_TYPES.ACADEMIC,
    categoryName: 'Library & Knowledge Hub',
    x: 1260,
    y: 680,
    width: 200,
    height: 160,
    description:
      'A multi-tier digital and physical knowledge repository housing 15,000+ textbooks, international journals, IEEE/ACM digital access terminals, and air-conditioned quiet reading zones.',
    services: ['IEEE Xplore Digital Access', 'Quiet Reading Hall', 'Book Issue/Return Desk', 'Periodicals & Journals Section', 'Accessible E-Reader Station', 'Discussion Pods'],
    hours: '8:00 AM - 10:00 PM (Extended during Exams)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: true,
      tactilePaving: true,
      brailleSignage: true,
      accessibleRestrooms: true,
      details: 'Ramped main portico, wide automatic glass doors, ground-floor accessible study carrels, screen-magnification software and digital e-readers for visually impaired students.'
    },
    keywords: ['library', 'books', 'study', 'quiet', 'reading', 'journals', 'ieee', 'research', 'papers', 'wifi', 'accessible']
  },
  {
    id: 'innovation-hub',
    name: 'Innovation & Incubation Centre (IIEC)',
    type: LOCATION_TYPES.RESEARCH,
    categoryName: 'Innovation & Research',
    x: 1260,
    y: 440,
    width: 200,
    height: 150,
    description:
      'The startup incubator and tech innovation hub of IIIT Bhopal. Supports student-led ventures, maker space prototypes, open-source projects, and annual hackathons.',
    services: ['Startup Incubation Desk', 'Rapid Prototyping & 3D Printing Lab', 'Developer Community Lounge', 'Intellectual Property Cell', 'Tech Club HQ'],
    hours: '9:00 AM - 9:00 PM (24H during Hackathons)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: false,
      details: 'Ground floor step-free entrance, open floor layout with wide corridors suitable for wheelchair mobility.'
    },
    keywords: ['innovation', 'startup', 'incubation', 'hackathon', 'maker', '3d printing', 'coding club', 'projects', 'iiec']
  },
  {
    id: 'placement-cell',
    name: 'Training & Placement Cell (T&P Centre)',
    type: LOCATION_TYPES.ACADEMIC,
    categoryName: 'Career & Placement',
    x: 320,
    y: 460,
    width: 220,
    height: 140,
    description:
      'Dedicated facility coordinating internships, campus recruitment, technical mock interviews, and industry-academia liaisons for IIIT Bhopal graduates.',
    services: ['Corporate Interview Suites', 'Group Discussion Rooms', 'Placement Officer Chamber', 'Resume Counseling Desk', 'Pre-Placement Talk Auditorium'],
    hours: '9:30 AM - 6:00 PM',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: false,
      details: 'Step-free entrance ramp, accessible interview suites and counseling cubicles.'
    },
    keywords: ['placement', 'training', 't&p', 'jobs', 'internships', 'interviews', 'careers', 'companies', 'recruitment', 'accessible']
  },
  {
    id: 'hostel-boys',
    name: "Swami Vivekananda Boys' Hostel",
    type: LOCATION_TYPES.HOSTEL,
    categoryName: 'Residential',
    x: 240,
    y: 240,
    width: 260,
    height: 170,
    description:
      'Multi-storey residential hostel for male undergraduate students. Features furnished rooms, high-speed LAN, reading room, indoor games room, and 24/7 power backup.',
    services: ['Warden Office', 'Resident Common Hall', 'Dining Mess Hall', 'Table Tennis & Carrom', 'High-speed Wi-Fi & LAN', 'Laundromat Facility', 'Ground Floor Accessible Rooms'],
    hours: 'Residents Access 24/7 (Night curfew: 10:30 PM)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: false,
      accessibleRestrooms: true,
      details: 'Wheelchair access ramp at main entrance, dedicated ground-floor rooms with roll-in accessible bathrooms for students with reduced mobility.'
    },
    keywords: ['hostel', 'boys hostel', 'room', 'dorm', 'residence', 'mess', 'warden', 'accommodation', 'living']
  },
  {
    id: 'hostel-girls',
    name: "Sarojini Naidu Girls' Hostel",
    type: LOCATION_TYPES.HOSTEL,
    categoryName: 'Residential',
    x: 1040,
    y: 240,
    width: 240,
    height: 170,
    description:
      'Secure, fully furnished residential complex for female undergraduate students. Features round-the-clock female security personnel, resident medical room, common lounge, and high-speed internet.',
    services: ['Dedicated Female Security 24/7', 'Warden Office', 'Dining Mess Hall', 'Study Room & Lounge', 'Wi-Fi & LAN Facilities', 'Health Clinic', 'Ground Floor Accessible Rooms'],
    hours: 'Residents Access 24/7 (Night curfew: 10:00 PM)',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: false,
      accessibleRestrooms: true,
      details: 'Ramped main entrance with security guard rail, accessible ground-floor living quarters with wide doorways.'
    },
    keywords: ['hostel', 'girls hostel', 'female', 'dorm', 'mess', 'security', 'warden', 'residence', 'rooms']
  },
  {
    id: 'food-court',
    name: 'Campus Cafeteria & Food Court',
    type: LOCATION_TYPES.FOOD,
    categoryName: 'Dining & Refreshments',
    x: 920,
    y: 940,
    width: 200,
    height: 140,
    description:
      'The bustling social and culinary hub of IIIT Bhopal. Serves hygienic breakfast, lunch, snacks, and dinner with North and South Indian dishes, plus a popular Nescafe kiosk.',
    services: ['Student Canteen', 'Nescafe Coffee & Snacks Kiosk', 'Juice Bar', 'Covered Outdoor Patio', 'Digital UPI Payment Counters', 'Accessible Dining Tables'],
    hours: '7:30 AM - 10:00 PM',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: false,
      details: 'Ground floor step-free dining floor, low-height counter section, and priority wheelchair dining tables.'
    },
    keywords: ['food', 'canteen', 'cafeteria', 'coffee', 'nescafe', 'lunch', 'dinner', 'snacks', 'eat', 'tea', 'juice', 'accessible']
  },
  {
    id: 'sports-complex',
    name: 'Sports Complex & Athletic Grounds',
    type: LOCATION_TYPES.SPORTS,
    categoryName: 'Sports & Fitness',
    x: 320,
    y: 1000,
    width: 260,
    height: 200,
    description:
      'Expansive outdoor and indoor sports facility supporting football, cricket, basketball, volleyball, badminton, and a modern student fitness gymnasium.',
    services: ['Cricket & Football Ground', 'Floodlit Basketball Court', 'Indoor Badminton Courts', 'Student Fitness Gymnasium', 'Athletic Track', 'Accessible Spectator Stands'],
    hours: '5:30 AM - 8:30 PM',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: false,
      details: 'Smooth asphalt access pathway from main road, ramped access to spectator stands and pavilion.'
    },
    keywords: ['sports', 'ground', 'cricket', 'football', 'basketball', 'badminton', 'gym', 'fitness', 'athletic', 'games']
  },
  {
    id: 'central-courtyard',
    name: 'Central Courtyard & Open Air Theatre (OAT)',
    type: LOCATION_TYPES.OTHER,
    categoryName: 'Public & Recreation',
    x: 640,
    y: 940,
    width: 240,
    height: 160,
    description:
      'Lush landscaped amphitheatre and central gathering plaza. Used for college cultural evenings, club exhibitions, street theatre, festival celebrations, and open-air movie screenings.',
    services: ['Amphitheatre Seating', 'Green Lawn Plaza', 'Acoustic Stage Platform', 'Night Lighting & Seating Benches', 'Step-Free Lawn Paths'],
    hours: 'Open 24 Hours',
    searchable: true,
    interactive: true,
    verified: true,
    accessibility: {
      wheelchairAccessible: true,
      ramp: true,
      elevator: false,
      details: 'Continuous smooth paved walkways surrounding the courtyard lawn, step-free access to stage viewing areas.'
    },
    keywords: ['courtyard', 'oat', 'amphitheatre', 'lawn', 'garden', 'events', 'fest', 'stage', 'culture', 'open air']
  }
];

export function getLocationById(id) {
  return LOCATIONS.find((loc) => loc.id === id) || null;
}

export function searchLocations(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];
  return LOCATIONS.filter((loc) => {
    if (!loc.searchable) return false;
    const inName = (loc.name || '').toLowerCase().includes(q);
    const inType = (loc.type || '').toLowerCase().includes(q);
    const inCategory = (loc.categoryName || '').toLowerCase().includes(q);
    const inDesc = (loc.description || '').toLowerCase().includes(q);
    const inServices = (loc.services || []).some((s) => s.toLowerCase().includes(q));
    const inKeywords = (loc.keywords || []).some((k) => k.toLowerCase().includes(q));
    const inAccessibility = Boolean(
      loc.accessibility?.wheelchairAccessible &&
      (q.includes('access') || q.includes('wheelchair') || q.includes('ramp') || q.includes('pwd') || q.includes('disab'))
    );
    const inClassrooms = (loc.classrooms || []).some(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.currentClass?.subject || '').toLowerCase().includes(q) ||
        (c.currentClass?.code || '').toLowerCase().includes(q) ||
        (c.type || '').toLowerCase().includes(q)
    );
    return inName || inType || inCategory || inDesc || inServices || inKeywords || inAccessibility || inClassrooms;
  });
}

export function getCategories() {
  const map = new Map();
  LOCATIONS.forEach((loc) => {
    if (!map.has(loc.type)) {
      map.set(loc.type, {
        type: loc.type,
        name: loc.categoryName || loc.type,
        count: 0,
        icon: LOCATION_ICONS[loc.type] || 'MapPin'
      });
    }
    map.get(loc.type).count++;
  });
  return Array.from(map.values());
}
