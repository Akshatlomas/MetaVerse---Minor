/**
 * mockLocations.js
 * -----------------------------------------------------------------------
 * Server-side verified & modeled dataset for IIIT Bhopal Metaverse.
 * Matches client/src/data/locations.js for full parity between backend
 * and frontend in both Demo Mode and Database Mode.
 * Includes accessible smart classrooms, lecture hall complexes, and
 * PwD/wheelchair-friendly specifications.
 * -----------------------------------------------------------------------
 */

export const MOCK_LOCATIONS = [
  {
    id: 'main-gate',
    name: 'Main Campus Entrance Gate',
    type: 'entrance',
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
    type: 'admin',
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
    type: 'academic',
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
        equipment: ['Interactive Digital Whiteboard', 'Auto-Tracking PTZ Camera', 'Acoustic Wall Panels']
      }
    ],
    keywords: ['cse', 'computer science', 'it', 'information technology', 'labs', 'coding', 'gpu', 'ai', 'programming', 'lecture', 'accessible']
  },
  {
    id: 'ece-block',
    name: 'Department of Electronics & Communication (ECE)',
    type: 'academic',
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
        equipment: ['FPGA & Microcontroller Testbenches', 'Digital Oscilloscopes', 'Smart Interactive Screen']
      }
    ],
    keywords: ['ece', 'electronics', 'communication', 'vlsi', 'iot', 'robotics', 'circuits', 'hardware', 'embedded', 'accessible']
  },
  {
    id: 'lecture-hall-complex',
    name: 'Lecture Hall Complex & Smart Classrooms (LHC)',
    type: 'classroom',
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
        equipment: ['Dual Digital Whiteboards', 'Collaborative Team Worktables', 'High-Speed Wi-Fi 6 Access Points']
      }
    ],
    keywords: ['lecture hall', 'lhc', 'smart classroom', 'lh101', 'lh-101', 'lh102', 'lh-102', 'classroom', 'class', 'lecture', 'tutorial', 'accessible', 'wheelchair', 'projector', 'smartboard']
  },
  {
    id: 'aryabhata-classroom-complex',
    name: 'Aryabhata Academic & Tutorial Complex (Block B)',
    type: 'classroom',
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
        equipment: ['Interactive Touch Screen', 'Mobile Ergonomic Desks', 'Overhead Document Projector']
      }
    ],
    keywords: ['aryabhata', 'tutorial', 'seminar', 'seminar hall', 'sh1', 'tr201', 'classroom', 'class', 'lecture', 'accessible', 'wheelchair', 'ramp', 'smart classroom']
  },
  {
    id: 'central-library',
    name: 'Dr. APJ Abdul Kalam Central Library',
    type: 'academic',
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
    type: 'research',
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
    type: 'academic',
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
    type: 'hostel',
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
    type: 'hostel',
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
    type: 'food',
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
    type: 'sports',
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
    type: 'other',
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
