"use client";

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, FileText, LockKeyhole, Play } from 'lucide-react';
import { Button } from '@/components/academy-ui';
import { Page } from '@/components/page-shell';
import { getCourse } from '@/lib/academy-data';
import { downloadTextFile, slugify } from '@/lib/downloads';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function LessonViewer() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>();
  const course = getCourse(id);
  const lessonIndex = Math.max(0, course.modules.findIndex((module) => module.id === lessonId));
  const lesson = course.modules[lessonIndex] ?? course.modules[0];
  const next = course.modules[lessonIndex + 1];
  const [downloaded, setDownloaded] = useState(false);

  const downloadNotes = () => {
    downloadTextFile(
      `${slugify(lesson.title)}-notes.txt`,
      `${lesson.title}\n\nField notes from KoolTech Fix IT Academy.\n\nRemember: name the symptom, test one thing, record what changed.`,
    );
    setDownloaded(true);
  };

  return (
    <Page>
      <Link
        href={`/courses/${course.id}`}
        className="row"
        style={{ color: '#77766f', fontSize: 13, marginBottom: 22 }}
        data-testid="link-back-course"
      >
        <ArrowLeft size={15} /> {course.title}
      </Link>
      <div className="lesson-layout">
        <section>
          <div className="video-frame" data-testid="video-player">
            <iframe
              src={`https://www.youtube.com/embed/${lesson.videoId}`}
              title={`${lesson.title} lesson video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
          <div className="lesson-copy">
            <span className="eyebrow">Module {lessonIndex + 1} of {course.moduleCount}</span>
            <h1 style={{ marginTop: 10 }}>{lesson.title}</h1>
            <p>
              Good technicians slow down just enough to see the pattern. In this lesson, you will work through the clues,
              the checks, and the small decision that gets you unstuck.
            </p>
            <div className="card notes">
              <div className="section-head">
                <h3><FileText size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} />Lecture notes</h3>
                <Button variant="ghost" onClick={downloadNotes} testId="button-download-notes">
                  <Download size={15} /> {downloaded ? 'Downloaded' : 'Download notes'}
                </Button>
              </div>
              <ul>
                <li>Start with the symptom, not the suspected cause.</li>
                <li>Change one variable at a time so your result teaches you something.</li>
                <li>Write down what you checked — future you is part of the team.</li>
              </ul>
            </div>
            <div className="lesson-nav">
              {lessonIndex > 0 ? (
                <Link
                  href={`/courses/${course.id}/lessons/${course.modules[lessonIndex - 1].id}`}
                  className="button button-ghost"
                  data-testid="link-previous-lesson"
                >
                  <ArrowLeft size={15} /> Previous
                </Link>
              ) : <span />}
              {next ? (
                <Link href={`/courses/${course.id}/lessons/${next.id}`} className="button button-primary" data-testid="link-next-lesson">
                  Next lesson <ArrowRight size={15} />
                </Link>
              ) : (
                <Link href={`/courses/${course.id}/quiz`} className="button button-primary" data-testid="link-course-quiz">
                  Take the quiz <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </section>
        <aside className="card lesson-side">
          <h3>In this course</h3>
          {course.modules.map((module, index) => (
            <Link
              href={module.state === 'locked' ? '#' : `/courses/${course.id}/lessons/${module.id}`}
              key={module.id}
              className={`lesson-side-row ${index === lessonIndex ? 'active' : ''}`}
              onClick={(event) => {
                if (module.state === 'locked') event.preventDefault();
              }}
              data-testid={`link-lesson-sidebar-${module.id}`}
            >
              {module.state === 'locked' ? <LockKeyhole size={14} /> : module.state === 'complete' ? <Check size={14} /> : <Play size={14} />}
              <span>{index + 1}. {module.title}</span>
            </Link>
          ))}
        </aside>
      </div>
    </Page>
  );
}