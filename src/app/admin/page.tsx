"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck, Users } from "lucide-react";

import { AdminEmptyState } from "@/components/admin/admin-page-states";
import { Page } from "@/components/page-shell";
import { useAdminDashboard } from "@/hooks/admin/use-admin-dashboard";
import { getApiErrorMessage } from "@/lib/api/api-error";

const SECTIONS = [
  {
    href: "/admin/instructors",
    icon: ShieldCheck,
    title: "Instructors",
    description: "Review instructor applications and approve or reject them.",
  },
  {
    href: "/admin/courses",
    icon: BookOpen,
    title: "Courses",
    description: "Inspect course content, and flag or remove courses.",
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "Users",
    description: "Suspend or remove learners and instructors who break the rules.",
  },
];

export default function AdminDashboardPage() {
  const { data: counts, isLoading, isError, error } = useAdminDashboard();

  const stats = [
    {
      label: "Pending instructors",
      value: counts?.pendingInstructors,
      href: "/admin/instructors",
    },
    {
      label: "Published courses",
      value: counts?.publishedCourses,
      href: "/admin/courses",
    },
    {
      label: "Flagged courses",
      value: counts?.flaggedCourses,
      href: "/admin/courses",
    },
    { label: "Learners", value: counts?.learners, href: "/admin/users" },
  ];

  return (
    <Page>
      <div className="page-head">
        <div>
          <span className="eyebrow">Academy administration</span>
          <h1>Admin overview</h1>
          <p>Approve instructors, review course content, and keep the academy safe.</p>
        </div>
      </div>

      {isError ? (
        <AdminEmptyState
          icon={<ShieldCheck size={24} />}
          title="Unable to load overview"
          message={getApiErrorMessage(error)}
        />
      ) : (
        <div className="admin-stat-grid">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="card stat-card"
              data-testid={`stat-${stat.label.toLowerCase().replaceAll(" ", "-")}`}
            >
              <strong>{isLoading ? "–" : stat.value}</strong>
              <span>{stat.label}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="admin-entry-grid">
        {SECTIONS.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="card admin-entry-card">
            <div className="empty-icon" style={{ margin: 0 }}>
              <Icon size={22} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <ArrowRight size={18} aria-hidden="true" style={{ marginTop: "auto" }} />
          </Link>
        ))}
      </div>
    </Page>
  );
}
