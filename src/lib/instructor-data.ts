import { InstructorCourse, Enrollee } from './instructor-types';

export const initialInstructorCourses: InstructorCourse[] = [
  {
    id: 'c-1',
    title: 'Advanced Hardware Diagnostics',
    description: 'Deep dive into motherboard component testing and repair. This course covers everything from identifying blown capacitors to tracing broken traces on complex boards. Ideal for technicians looking to level up their board repair skills.',
    status: 'Published',
    enrolleeCount: 5,
    modules: [
      {
        id: 'm-1',
        title: 'Motherboard Architecture',
        order: 1,
        lessons: [
          { id: 'l-1', title: 'Power Delivery Explained', youtubeLink: 'https://youtube.com/watch?v=123' },
          { id: 'l-2', title: 'Tracing the 3.3V Rail', youtubeLink: 'https://youtube.com/watch?v=456', notesFilename: 'schematic_diagrams.docx' }
        ],
        quizQuestions: [
          {
            id: 'q-1',
            text: 'Which component regulates CPU voltage?',
            options: ['VRM', 'Northbridge', 'Southbridge', 'CMOS battery'],
            correctOptionIndex: 0
          },
          {
            id: 'q-2',
            text: 'What is the standard resistance for a working 3.3V rail to ground?',
            options: ['10 ohms', '100 ohms', '1000+ ohms', '0 ohms'],
            correctOptionIndex: 2
          }
        ]
      }
    ],
    finalAssessment: [
      {
        id: 'fq-1',
        text: 'When a laptop powers on but shows no display, which of these is the LEAST likely cause?',
        options: ['Faulty RAM', 'Corrupted BIOS', 'Broken display cable', 'Failing hard drive'],
        correctOptionIndex: 3
      }
    ]
  },
  {
    id: 'c-2',
    title: 'Network Troubleshooting Basics',
    description: 'Learn the fundamentals of identifying and fixing connectivity issues in small office networks.',
    status: 'Draft',
    enrolleeCount: 0,
    modules: [
      {
        id: 'm-2',
        title: 'Introduction to OSI Model',
        order: 1,
        lessons: [],
        quizQuestions: []
      }
    ],
    finalAssessment: []
  }
];

export const initialEnrollees: Record<string, Enrollee[]> = {
  'c-1': [
    {
      id: 'e-1',
      name: 'Samuel Adebayo',
      progress: 100,
      finalAssessmentResult: 92,
      moduleResults: [{ moduleId: 'm-1', score: 2, total: 2 }]
    },
    {
      id: 'e-2',
      name: 'Grace Nwosu',
      progress: 50,
      finalAssessmentResult: 'In progress',
      moduleResults: []
    },
    {
      id: 'e-3',
      name: 'Obi Obi',
      progress: 100,
      finalAssessmentResult: 78,
      moduleResults: [{ moduleId: 'm-1', score: 1, total: 2 }]
    },
    {
      id: 'e-4',
      name: 'Fatima Bello',
      progress: 0,
      finalAssessmentResult: 'In progress',
      moduleResults: []
    },
    {
      id: 'e-5',
      name: 'Kwame Mensah',
      progress: 100,
      finalAssessmentResult: 95,
      moduleResults: [{ moduleId: 'm-1', score: 2, total: 2 }]
    }
  ]
};
