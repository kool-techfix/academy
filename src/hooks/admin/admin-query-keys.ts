import type { ModeratedRole } from "@/Services/admin.service";
import type { InstructorStatus } from "@/Services/auth.service";

export const ADMIN_DASHBOARD_QUERY_KEY = ["admin", "dashboard"] as const;

export const ADMIN_INSTRUCTORS_QUERY_KEY = ["admin", "instructors"] as const;

export const adminInstructorsQueryKey = (status?: InstructorStatus) =>
  [...ADMIN_INSTRUCTORS_QUERY_KEY, status ?? "ALL"] as const;

export const ADMIN_COURSES_QUERY_KEY = ["admin", "courses"] as const;

export const adminCourseQueryKey = (courseId: string) =>
  [...ADMIN_COURSES_QUERY_KEY, courseId] as const;

export const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;

export const adminUsersQueryKey = (role?: ModeratedRole) =>
  [...ADMIN_USERS_QUERY_KEY, role ?? "ALL"] as const;
