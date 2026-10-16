"use client";

import { ArrowRight } from "lucide-react";
import { Brand, BrandSignature } from "@/components/academy-brand";
import { CourseCard } from "@/components/academy-ui";
import { LandingHeroRotator } from "@/components/landing-hero-rotator";
import { LanguageSwitch } from "@/components/language-switch";
import Link from "next/link";
import { usePublicCourses } from "@/hooks/use-public-courses";

export default function Landing() {
  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
  } = usePublicCourses();
  return (
    <div className="landing-shell">
      <header className="landing-header">
        <Brand />
        <nav className="landing-nav" aria-label="Public navigation">
          <a href="#courses">Courses</a>
          <a href="#about">About KoolTech</a>
        </nav>
        <div className="landing-actions">
          <LanguageSwitch />
          <Link href="/login" className="landing-login">
            Log in
          </Link>
          <Link
            href="/register"
            className="button button-primary landing-get-started"
            data-testid="link-landing-get-started"
          >
            Get Started
          </Link>
          {/* Phones: a single "Log in" button replaces both links above. */}
          <Link
            href="/login"
            className="button button-primary landing-login-mobile"
            data-testid="link-landing-login-mobile"
          >
            Log in
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <LandingHeroRotator>
            <div className="landing-hero-actions">
              <Link
                href="/register"
                className="button button-primary"
                data-testid="link-hero-get-started"
              >
                Get Started <ArrowRight size={16} />
              </Link>
              <Link href="#courses" className="button button-ghost">
                Explore courses
              </Link>
            </div>
          </LandingHeroRotator>
          <BrandSignature />
          <div className="landing-hero-note">
            <span className="eyebrow">The KoolTech approach</span>
            <strong>Learn a little. Practise a lot. Keep the proof.</strong>
            <span>
              Lessons that help you make the next useful decision, not just
              remember another definition.
            </span>
          </div>
        </section>

        <section className="landing-section" id="courses">
          <div className="section-head">
            <div>
              <span className="eyebrow">Start with something useful</span>
              <h2>Featured courses</h2>
            </div>
            <Link href="/register" className="button button-ghost">
              See the full curriculum <ArrowRight size={15} />
            </Link>
          </div>
          <div className="course-grid landing-course-grid">
            {coursesLoading ? (
              <p>Loading courses...</p>
            ) : coursesError ? (
              <p>Unable to load courses right now.</p>
            ) : courses?.length ? (
              courses
                .slice(0, 4)
                .map((course, index) => (
                  <CourseCard key={course.id} course={course} index={index} />
                ))
            ) : (
              <p>No courses are currently available.</p>
            )}
          </div>
        </section>

        <section className="landing-about" id="about">
          <div>
            <span className="eyebrow">A better way to learn IT</span>
            <h2>Skills that hold up when the room is busy.</h2>
          </div>
          <div className="landing-about-copy">
            <p>
              KoolTech Fix IT Academy is a focused place to build the habits,
              vocabulary, and practical judgement that technicians use every
              day.
            </p>
            <p>
              Move at your own pace, return to the lessons that matter, and
              leave each course with a clearer sense of what you can do next.
            </p>
          </div>
          <div className="landing-highlights">
            <div>
              <strong>01</strong>
              <span>Learn at your own pace</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Real instructors, practical lessons</span>
            </div>
            <div>
              <strong>03</strong>
              <span>Certificates on completion</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Brand />
        <span>© 2024 Kool TechFix I.T Academy</span>
        <div>
          <Link href="/login">Log in</Link>
          <Link href="/register">Get Started</Link>
        </div>
      </footer>
    </div>
  );
}
