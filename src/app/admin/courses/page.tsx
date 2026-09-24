"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import {
  AdminBackLink,
  AdminEmptyState,
  AdminLoading,
  formatDate,
} from "@/components/admin/admin-page-states";
import { StatusBadge } from "@/components/admin/status-badge";
import { Page } from "@/components/page-shell";
import { useAdminCourses } from "@/hooks/admin/use-admin-courses";
import { getApiErrorMessage } from "@/lib/api/api-error";
import type { AdminCourse } from "@/Services/admin.service";

const FILTERS: { label: string; matches: (course: AdminCourse) => boolean }[] = [
  { label: "All", matches: () => true },
  {
    label: "Published",
    matches: (course) =>
      course.status === "PUBLISHED" && course.moderationStatus !== "REMOVED",
  },
  { label: "Flagged", matches: (course) => course.moderationStatus === "FLAGGED" },
  { label: "Removed", matches: (course) => course.moderationStatus === "REMOVED" },
];

export default function AdminCoursesPage() {
  const [filterLabel, setFilterLabel] = useState("All");
  const { data: courses = [], isLoading, isError, error } = useAdminCourses();

  const filter = FILTERS.find((option) => option.label === filterLabel) ?? FILTERS[0];
  const visibleCourses = courses.filter(filter.matches);

  return (
    <Page>
      <AdminBackLink />

      <div className="page-head">
        <div>
          <span className="eyebrow">Course moderation</span>
          <h1>Courses</h1>
          <p>Review course content and act on courses that break platform requirements.</p>
        </div>
      </div>

      <div className="auth-tabs" role="tablist" aria-label="Filter courses">
        {FILTERS.map((option) => (
          <button
            key={option.label}
            type="button"
            role="tab"
            aria-selected={filterLabel === option.label}
            className={`auth-tab ${filterLabel === option.label ? "active" : ""}`}
            onClick={() => setFilterLabel(option.label)}
            data-testid={`tab-courses-${option.label.toLowerCase()}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <AdminLoading message="Loading courses..." />
      ) : isError ? (
        <AdminEmptyState
          icon={<BookOpen size={24} />}
          title="Unable to load courses"
          message={getApiErrorMessage(error)}
        />
      ) : visibleCourses.length === 0 ? (
        <AdminEmptyState
          icon={<BookOpen size={24} />}
          title="No courses"
          message={
            filterLabel === "All"
              ? "Courses created by instructors will appear here."
              : `There are no ${filterLabel.toLowerCase()} courses.`
          }
        />
      ) : (
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Status</th>
                <th>Moderation</th>
                <th>Modules</th>
                <th>Learners</th>
                <th>Created</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((course) => (
                <tr key={course.id} data-testid={`row-course-${course.id}`}>
                  <td>
                    <strong>{course.title}</strong>
                    <span className="admin-sub">
                      {course.instructors.map((instructor) => instructor.name).join(", ") ||
                        "No instructor"}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={course.status} />
                  </td>
                  <td>
                    {course.moderationStatus === "NONE" ? (
                      <span className="admin-sub">—</span>
                    ) : (
                      <>
                        <StatusBadge status={course.moderationStatus} />
                        {course.moderationReason && (
                          <span className="admin-reason">{course.moderationReason}</span>
                        )}
                      </>
                    )}
                  </td>
                  <td>{course._count.modules}</td>
                  <td>{course._count.enrollments}</td>
                  <td>{formatDate(course.createdAt)}</td>
                  <td>
                    <div className="admin-row-actions">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="button button-ghost"
                        data-testid={`link-review-course-${course.id}`}
                      >
                        Review
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}
