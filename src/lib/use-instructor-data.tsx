import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InstructorCourse, Enrollee } from './instructor-types';
import { initialInstructorCourses, initialEnrollees } from './instructor-data';

interface InstructorContextType {
  courses: InstructorCourse[];
  enrollees: Record<string, Enrollee[]>;
  addCourse: (course: Pick<InstructorCourse, 'title' | 'description'>) => InstructorCourse;
  updateCourse: (id: string, updates: Partial<InstructorCourse>) => void;
  canPublish: (course: InstructorCourse) => boolean;
}

const InstructorContext = createContext<InstructorContextType | null>(null);

export function InstructorProvider({ children }: { children: ReactNode }) {
  const [courses, setCourses] = useState<InstructorCourse[]>(initialInstructorCourses);
  const [enrollees, setEnrollees] = useState(initialEnrollees);

  const addCourse = (data: Pick<InstructorCourse, 'title' | 'description'>) => {
    const newCourse: InstructorCourse = {
      id: `c-${Date.now()}`,
      title: data.title,
      description: data.description,
      status: 'Draft',
      modules: [],
      finalAssessment: [],
      enrolleeCount: 0,
    };
    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  };

  const updateCourse = (id: string, updates: Partial<InstructorCourse>) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const canPublish = (course: InstructorCourse) => {
    return course.modules.some(m => m.lessons.length > 0 && m.quizQuestions.length > 0);
  };

  return (
    <InstructorContext.Provider value={{ courses, enrollees, addCourse, updateCourse, canPublish }}>
      {children}
    </InstructorContext.Provider>
  );
}

export function useInstructorData() {
  const context = useContext(InstructorContext);
  if (!context) throw new Error('useInstructorData must be used within InstructorProvider');
  return context;
}
