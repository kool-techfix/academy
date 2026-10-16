"use client";

import { ArrowRight } from "lucide-react";
import { Brand, BrandSignature } from "@/components/academy-brand";
import { CourseCard } from "@/components/academy-ui";
import { LandingHeroRotator } from "@/components/landing-hero-rotator";
import { LanguageSwitch } from "@/components/language-switch";
import Link from "next/link";
import { useEffect } from "react";
import { usePublicCourses } from "@/hooks/use-public-courses";
import { landingMessages } from "@/lib/landing-messages";
import { useLocale } from "@/lib/locale";

export default function Landing() {
  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
  } = usePublicCourses();
  const locale = useLocale();
  const t = landingMessages[locale];

  // Only this page is translated: mark the document language while it is
  // mounted, and restore English when navigating away.
  useEffect(() => {
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = "en";
    };
  }, [locale]);

  return (
    <div className="landing-shell">
      <header className="landing-header">
        <Brand />
        <nav className="landing-nav" aria-label={t.nav.label}>
          <a href="#courses">{t.nav.courses}</a>
          <a href="#about">{t.nav.about}</a>
        </nav>
        <div className="landing-actions">
          <LanguageSwitch />
          <Link href="/login" className="landing-login">
            {t.nav.logIn}
          </Link>
          <Link
            href="/register"
            className="button button-primary landing-get-started"
            data-testid="link-landing-get-started"
          >
            {t.nav.getStarted}
          </Link>
          {/* Phones: a single "Log in" button replaces both links above. */}
          <Link
            href="/login"
            className="button button-primary landing-login-mobile"
            data-testid="link-landing-login-mobile"
          >
            {t.nav.logIn}
          </Link>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <LandingHeroRotator copy={t.hero}>
            <div className="landing-hero-actions">
              <Link
                href="/register"
                className="button button-primary"
                data-testid="link-hero-get-started"
              >
                {t.hero.getStarted} <ArrowRight size={16} />
              </Link>
              <Link href="#courses" className="button button-ghost">
                {t.hero.exploreCourses}
              </Link>
            </div>
          </LandingHeroRotator>
          <BrandSignature />
          <div className="landing-hero-note">
            <span className="eyebrow">{t.note.eyebrow}</span>
            <strong>{t.note.title}</strong>
            <span>{t.note.body}</span>
          </div>
        </section>

        <section className="landing-section" id="courses">
          <div className="section-head">
            <div>
              <span className="eyebrow">{t.courses.eyebrow}</span>
              <h2>{t.courses.title}</h2>
            </div>
            <Link href="/register" className="button button-ghost">
              {t.courses.fullCurriculum} <ArrowRight size={15} />
            </Link>
          </div>
          <div className="course-grid landing-course-grid">
            {coursesLoading ? (
              <p>{t.courses.loading}</p>
            ) : coursesError ? (
              <p>{t.courses.error}</p>
            ) : courses?.length ? (
              courses
                .slice(0, 4)
                .map((course, index) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    index={index}
                    labels={t.courseCard}
                  />
                ))
            ) : (
              <p>{t.courses.empty}</p>
            )}
          </div>
        </section>

        <section className="landing-about" id="about">
          <div>
            <span className="eyebrow">{t.about.eyebrow}</span>
            <h2>{t.about.title}</h2>
          </div>
          <div className="landing-about-copy">
            {t.about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="landing-highlights">
            {t.about.highlights.map((highlight, i) => (
              <div key={i}>
                <strong>{String(i + 1).padStart(2, "0")}</strong>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Brand />
        <span>© 2024 Kool TechFix I.T Academy</span>
        <div>
          <Link href="/login">{t.footer.logIn}</Link>
          <Link href="/register">{t.footer.getStarted}</Link>
        </div>
      </footer>
    </div>
  );
}
