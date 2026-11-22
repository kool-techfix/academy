import type { Metadata } from "next";

// Invite-only page: the link is shared directly with prospective instructors,
// so keep it out of search results.
export const metadata: Metadata = {
  title: "Instructor sign-up | Kool TechFix ITAcad",
  robots: { index: false, follow: false },
};

export default function InstructorRegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
