import type { ComponentType } from 'react';

export type Accent = 'lime' | 'coral' | 'ink' | 'sand' | 'sage' | 'stone';

export type Module = {
  id: string;
  title: string;
  duration: string;
  type: 'lesson' | 'quiz';
  state: 'complete' | 'current' | 'locked';
  videoId: string;
};

export type Course = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  level: string;
  moduleCount: number;
  duration: string;
  category: string;
  status: 'in-progress' | 'not-started' | 'complete';
  progress: number;
  currentModule: number;
  instructor: string;
  accent: Accent;
  modules: Module[];
};

export type ActivityItem = {
  icon: ComponentType<{ size?: number }>;
  text: string;
  course: string;
  time: string;
};