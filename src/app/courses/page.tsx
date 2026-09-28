/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Grid2X2, List, Search } from "lucide-react";
import { Page } from "@/components/page-shell";
import { CourseCard, LearnerCourseCard, Button } from "@/components/academy-ui";

import { useLearnerCourses } from "@/hooks/learner/use-course";
import { useLearnerEnrollments } from "@/hooks/learner/use-enrollments";
import { useLearnerAllCourseProgress } from "@/hooks/learner/use-progress";

export default function Catalog() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const savedMode = sessionStorage.getItem("kooltech-view");

    if (savedMode === "grid" || savedMode === "list") {
      setMode(savedMode);
    }
  }, []);

  const setView = (next: "grid" | "list") => {
    setMode(next);
    sessionStorage.setItem("kooltech-view", next);
  };

  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
  } = useLearnerCourses();

  const { data: enrollments = [], isLoading: enrollmentsLoading } =
    useLearnerEnrollments();

  const { data: allProgress = [], isLoading: progressLoading } =
    useLearnerAllCourseProgress();

  const isLoading = coursesLoading || enrollmentsLoading || progressLoading;

  const enrollmentByCourseId = useMemo(
    () =>
      new Map(
        enrollments.map((enrollment) => [enrollment.courseId, enrollment]),
      ),
    [enrollments],
  );

  const progressByCourseId = useMemo(
    () => new Map(allProgress.map((progress) => [progress.courseId, progress])),
    [allProgress],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return courses;
    }

    return courses.filter((course) =>
      `${course.title} ${course.description}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [courses, query]);

  const search = (value: string) => {
    setQuery(value);
  };

  return (
    <Page>
      <div className="page-head">
        <div>
          <span className="eyebrow">The curriculum</span>
          <h1 style={{ marginTop: 10 }}>Build useful skills.</h1>
          <p>
            Short, practical courses taught by people who have spent time on the
            other side of the ticket.
          </p>
        </div>
        <div className="row">
          <BookOpen size={18} color="#73716a" />
          <span style={{ fontSize: 13, color: "#73716a" }}>
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </span>
        </div>
      </div>

      <div className="catalog-controls">
        <div className="search-box">
          <Search size={17} />
          <input
            type="search"
            value={query}
            onChange={(event) => search(event.target.value)}
            placeholder="Search courses, skills, topics..."
            aria-label="Search courses"
            data-testid="input-search-courses"
          />
        </div>
        <div className="row">
          <div className="view-toggle" role="group" aria-label="Course view">
            <button
              className={mode === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
              aria-label="Grid view"
              data-testid="button-grid-view"
            >
              <Grid2X2 size={17} />
            </button>
            <button
              className={mode === "list" ? "active" : ""}
              onClick={() => setView("list")}
              aria-label="List view"
              data-testid="button-list-view"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="course-grid">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="card" key={item} style={{ overflow: "hidden" }}>
              <div className="skeleton" style={{ height: 125 }} />
              <div style={{ padding: 20 }}>
                <div
                  className="skeleton"
                  style={{ height: 13, width: 80, marginBottom: 16 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 23, width: "80%", marginBottom: 12 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 42, width: "100%", marginBottom: 18 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 12, width: "60%" }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length ? (
        <div className={mode === "grid" ? "course-grid" : "course-list"}>
          {filtered.map((course, index) => {
            const enrollment = enrollmentByCourseId.get(course.id);

            if (enrollment) {
              const progress = progressByCourseId.get(course.id) ?? null;

              return (
                <LearnerCourseCard
                  key={course.id}
                  enrollment={enrollment}
                  progress={progress}
                  index={index}
                />
              );
            }

            return (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                mode={mode}
              />
            );
          })}
        </div>
      ) : (
        <div className="card empty-state" data-testid="empty-search-state">
          <div className="empty-icon">
            <Search size={22} />
          </div>
          <h3>No courses match that search.</h3>
          <p>Try a different skill, category, or a shorter phrase.</p>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
            }}
            testId="button-clear-search"
          >
            Clear filters
          </Button>
        </div>
      )}
    </Page>
  );
}
