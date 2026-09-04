"use client";

import { ArrowRight, CheckCircle2, Play, Trophy } from 'lucide-react';
import { CourseCard, ProgressBar } from '@/components/academy-ui';
import { Page } from '@/components/page-shell';
import { activity, courses } from '@/lib/academy-data';
import Link from 'next/link';

export default function Dashboard() {
  const inProgress = courses.filter((course) => course.status === 'in-progress');

  return (
    <Page>
      <section className="dashboard-hero">
        <div className="welcome">
          <span className="eyebrow">Tuesday, 18 June 2024</span>
          <h1 style={{ marginTop: 12 }}>
            Keep the momentum,
            <br />
            Daniel.
          </h1>
          <p>
            You are building the kind of practical knowledge that shows up in the work. Two
            focused sessions this week and you are on track.
          </p>
          <Link
            href="/courses/it-foundations/lessons/foundations-6"
            className="button button-primary"
            data-testid="link-resume-learning"
          >
            Resume learning <ArrowRight size={16} />
          </Link>
        </div>
        <div className="card stat-card" data-testid="card-learning-stats">
          <span className="eyebrow" style={{ color: '#696b39' }}>
            This week
          </span>
          <div>
            <strong>4.6</strong>
            <span> hours learning</span>
          </div>
          <ProgressBar value={64} label="Weekly target" />
          <small style={{ color: '#696b39' }}>2 sessions left to hit your target</small>
        </div>
      </section>

      <div className="section-head">
        <h2>Continue learning</h2>
        <Link href="/catalog" className="button button-ghost" data-testid="link-see-all-courses">
          See all courses <ArrowRight size={15} />
        </Link>
      </div>
      <div className="course-grid">
        {inProgress.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <div className="activity-grid">
        <section className="card panel">
          <div className="section-head">
            <h2>Recent activity</h2>
            <span className="eyebrow">Your trail</span>
          </div>
          {activity.map((item, index) => {
            const Icon = item.icon;
            return (
              <div className="activity" key={item.text} data-testid={`activity-item-${index}`}>
                <div className="activity-marker">
                  <Icon size={15} />
                </div>
                <div>
                  <p>{item.text}</p>
                  <span style={{ color: '#77766f', fontSize: 12 }}>{item.course}</span>
                  <time>{item.time}</time>
                </div>
              </div>
            );
          })}
        </section>
        <section className="card streak-card">
          <span className="eyebrow" style={{ color: '#7d4c48' }}>
            A useful habit
          </span>
          <h3 style={{ marginTop: 10 }}>Three days in a row.</h3>
          <p style={{ color: '#7d4c48', fontSize: 13 }}>
            Small, regular practice compounds. Keep your streak alive with one lesson today.
          </p>
          <div className="streak-days">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
              <div className="streak-day" key={`${day}-${index}`}>
                <span className={`streak-dot ${index < 3 ? 'active' : ''}`} />
                {day}
              </div>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}