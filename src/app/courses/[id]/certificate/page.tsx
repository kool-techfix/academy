import { useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Download } from 'lucide-react';
import { Badge, Button } from '@/components/academy-ui';
import { Page } from '@/components/page-shell';
import { getCourse } from '@/lib/academy-data';
import { downloadTextFile } from '@/lib/downloads';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function Certificate() {
  const { id } = useParams<{ id: string }>();
  const course = getCourse(id);
  const [downloaded, setDownloaded] = useState(false);

  const download = () => {
    downloadTextFile(
      `${course.id}-certificate.txt`,
      `KOOLTECH FIX IT ACADEMY\n\nCertificate of completion\n\nDaniel Okafor has completed ${course.title}.`,
    );
    setDownloaded(true);
  };

  return (
    <Page>
      <Link
        href={`/courses/${course.id}`}
        className="row"
        style={{ color: '#77766f', fontSize: 13, marginBottom: 22 }}
        data-testid="link-back-certificate-course"
      >
        <ArrowLeft size={15} /> Back to course
      </Link>
      <div className="card completion">
        <div className="completion-mark"><Check size={32} /></div>
        <span className="eyebrow">Course complete</span>
        <h1 style={{ marginTop: 10 }}>A job well done, Daniel.</h1>
        <p>
          You completed <strong>{course.title}</strong>. Keep this proof of practice close — and take the next useful step when you are ready.
        </p>
        <Button onClick={download} testId="button-download-certificate">
          <Download size={16} /> {downloaded ? 'Certificate downloaded' : 'Download certificate'}
        </Button>
        <div className="review-list">
          <div className="section-head" style={{ marginTop: 24 }}>
            <h3>Reviewable modules</h3>
            <Badge tone="coral">Completed</Badge>
          </div>
          {course.modules.map((module) => (
            <div className="review-row" key={module.id}>
              <Check size={16} />
              <span>{module.title}</span>
              <Link
                href={module.type === 'quiz' ? `/courses/${course.id}/quiz` : `/courses/${course.id}/lessons/${module.id}`}
                style={{ marginLeft: 'auto', color: '#69751b', fontWeight: 700, fontSize: 12 }}
                data-testid={`link-review-${module.id}`}
              >
                Review <ChevronRight size={13} style={{ verticalAlign: 'middle' }} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}