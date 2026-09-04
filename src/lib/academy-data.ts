import { CheckCircle2, Play, Trophy } from 'lucide-react';
import type { ActivityItem, Course, Module } from './academy-types';

const sampleVideoIds = ['rfscVS0vtbw', 'HXV3zeQKqGY'];

const makeModules = (
  prefix: string,
  names: string[],
  complete: number,
  current: number,
): Module[] =>
  names.map((title, index) => ({
    id: `${prefix}-${index + 1}`,
    title,
    duration: index === names.length - 1 ? '12 questions' : `${18 + index * 4} min`,
    type: index === names.length - 1 ? 'quiz' : 'lesson',
    state: index < complete ? 'complete' : index === current ? 'current' : 'locked',
    videoId: sampleVideoIds[index % sampleVideoIds.length],
  }));

export const courses: Course[] = [
  {
    id: 'it-foundations',
    title: 'IT Foundations: From Zero to Useful',
    shortDescription: 'The practical starting line for a career in IT support.',
    description:
      'Get comfortable with the building blocks technicians use every day: hardware, operating systems, troubleshooting habits, and the language of the help desk.',
    level: 'Beginner',
    moduleCount: 8,
    duration: '6h 20m',
    category: 'Foundations',
    status: 'in-progress',
    progress: 68,
    currentModule: 6,
    instructor: 'Maya Okoro',
    accent: 'lime',
    modules: makeModules(
      'foundations',
      [
        'How computers actually work',
        'Your first troubleshooting loop',
        'Operating systems in the wild',
        'Files, folders and permissions',
        'Hardware you can touch',
        'Reading a system report',
        'Ticket writing workshop',
        'Foundations checkpoint',
      ],
      5,
      5,
    ),
  },
  {
    id: 'networking-basics',
    title: 'Networking Basics for Real Offices',
    shortDescription: 'Understand the invisible infrastructure behind every connected workplace.',
    description:
      'Trace a packet, read a network diagram, and diagnose the common failures that make a room full of laptops suddenly go quiet.',
    level: 'Beginner',
    moduleCount: 7,
    duration: '5h 10m',
    category: 'Networking',
    status: 'in-progress',
    progress: 32,
    currentModule: 3,
    instructor: 'David Mensah',
    accent: 'coral',
    modules: makeModules(
      'networking',
      [
        'Packets, ports and protocols',
        'The anatomy of a LAN',
        'IP addresses without the fog',
        'DNS: the internet phonebook',
        'Wi-Fi field notes',
        'A practical network diagnosis',
        'Networking checkpoint',
      ],
      2,
      2,
    ),
  },
  {
    id: 'linux-command-line',
    title: 'Linux Command Line Field Guide',
    shortDescription: 'Stop fearing the terminal. Start using it as a force multiplier.',
    description:
      'A calm, hands-on tour through the shell commands, permissions, processes and small scripts that make technicians faster.',
    level: 'Intermediate',
    moduleCount: 9,
    duration: '7h 45m',
    category: 'Systems',
    status: 'not-started',
    progress: 0,
    currentModule: 0,
    instructor: 'Amina Yusuf',
    accent: 'ink',
    modules: makeModules(
      'linux',
      [
        'Meet the shell',
        'Moving around with confidence',
        'Files, pipes and useful output',
        'Permissions and ownership',
        'Processes and services',
        'Logs tell the truth',
        'Bash shortcuts',
        'A small automation script',
        'Command line checkpoint',
      ],
      0,
      0,
    ),
  },
  {
    id: 'help-desk',
    title: 'Help Desk: The Human Side of Tech',
    shortDescription: 'Turn frustrated conversations into clear, useful outcomes.',
    description:
      'Learn the communication patterns, ticket hygiene, prioritisation and calm diagnostic thinking that separates a good support technician from a great one.',
    level: 'Beginner',
    moduleCount: 6,
    duration: '4h 30m',
    category: 'Support',
    status: 'complete',
    progress: 100,
    currentModule: 6,
    instructor: 'Chinonso Eze',
    accent: 'sand',
    modules: makeModules(
      'helpdesk',
      [
        'The shape of a good ticket',
        'Ask better questions',
        'Triage without panic',
        'Writing for the next technician',
        'Difficult conversations',
        'Support skills review',
      ],
      6,
      6,
    ),
  },
  {
    id: 'cyber-hygiene',
    title: 'Cyber Hygiene for Every Technician',
    shortDescription: 'Build safer habits before a risky shortcut becomes an incident.',
    description:
      'A field-ready guide to identity, access, phishing, patching, backups and the small daily decisions that keep an organisation safer.',
    level: 'Intermediate',
    moduleCount: 7,
    duration: '5h 50m',
    category: 'Security',
    status: 'not-started',
    progress: 0,
    currentModule: 0,
    instructor: 'Tobi Adeyemi',
    accent: 'sage',
    modules: makeModules(
      'cyber',
      [
        'Threats in plain English',
        'Identity and access',
        'Spotting social engineering',
        'Patching and updating',
        'Backups that can be trusted',
        'Report the weird thing',
        'Security checkpoint',
      ],
      0,
      0,
    ),
  },
  {
    id: 'cloud-practical',
    title: 'Cloud Concepts, Kept Practical',
    shortDescription: 'Make sense of cloud services without memorising the brochure.',
    description:
      'Map familiar IT ideas to cloud services, understand shared responsibility, and leave with a vocabulary you can use in a real technical conversation.',
    level: 'Intermediate',
    moduleCount: 8,
    duration: '6h 05m',
    category: 'Cloud',
    status: 'not-started',
    progress: 0,
    currentModule: 0,
    instructor: 'Emeka Nwosu',
    accent: 'stone',
    modules: makeModules(
      'cloud',
      [
        'What “the cloud” is really saying',
        'Compute and storage',
        'Networks in the cloud',
        'Shared responsibility',
        'Costs and trade-offs',
        'Identity in cloud services',
        'Build a simple map',
        'Cloud concepts review',
      ],
      0,
      0,
    ),
  },
];

export const activity: ActivityItem[] = [
  {
    icon: CheckCircle2,
    text: 'Completed “Triage without panic”',
    course: 'Help Desk: The Human Side of Tech',
    time: 'Yesterday, 4:42 PM',
  },
  {
    icon: Play,
    text: 'Watched “Reading a system report”',
    course: 'IT Foundations: From Zero to Useful',
    time: 'Monday, 8:15 PM',
  },
  {
    icon: Trophy,
    text: 'Earned your first certificate',
    course: 'Help Desk: The Human Side of Tech',
    time: 'Sunday, 11:03 AM',
  },
];

export const quizQuestions = [
  {
    question: 'A user says their laptop “has no internet.” What is the most useful first move?',
    answers: [
      'Replace the network cable',
      'Ask what they can and cannot reach',
      'Restart the office router',
      'Change their password',
    ],
    correct: 1,
  },
  {
    question: 'Which detail makes a support ticket most useful to the next technician?',
    answers: [
      'A guess at the root cause',
      'The user’s job title',
      'What was tested and what changed',
      'A screenshot with no context',
    ],
    correct: 2,
  },
  {
    question: 'What does DNS primarily help a device do?',
    answers: [
      'Encrypt every packet',
      'Turn names into IP addresses',
      'Store user passwords',
      'Increase Wi-Fi signal',
    ],
    correct: 1,
  },
];

export const getCourse = (id?: string) =>
  courses.find((course) => course.id === id) ?? courses[0];