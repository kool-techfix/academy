"use client";

import { InstructorProvider } from "@/lib/use-instructor-data";

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <InstructorProvider>
      {children}
    </InstructorProvider>
  );
}