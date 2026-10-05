/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Grid2X2, List, Search } from "lucide-react";
import { CourseCard, Button } from "@/components/academy-ui";
import { usePublicCourses } from "@/hooks/use-public-courses";
import { Navbar } from "@/components/navbar";
import { LoadingScreen } from "@/components/Loader";

export default function Catalog() {
  const [query, setQuery] = useState("");
  // const [category, setCategory] = useState("All categories");
  const [mode, setMode] = useState<"grid" | "list">("grid");
  const { data: courses = [], isLoading } = usePublicCourses();

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

  const filtered = useMemo(
    () =>
      courses.filter(
        (course) =>
          `${course.title} ${course.description} `
            .toLowerCase()
            .includes(query.toLowerCase())
      ),
    [query, courses],
  );

  const search = (value: string) => {
    setQuery(value);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <>
    <Navbar />
      <main className="main">
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
          <BookOpen size={18} style={{ color: "var(--brand-text-muted)" }} />
          <span style={{ fontSize: 13, color: "var(--brand-text-muted)" }}>
            {courses.length} courses
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
          {/* <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="filter-select"
            aria-label="Filter by category"
            data-testid="select-category"
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select> */}
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
          {filtered.map((course, index) => (
            <CourseCard key={course.id} course={course} mode={mode} index={index} />
          ))}
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
              // setCategory("All categories");
            }}
            testId="button-clear-search"
          >
            Clear filters
          </Button>
        </div>
      )}
      </main>
    </>
  );
}
