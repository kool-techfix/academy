import type { ReactNode } from 'react';
import { Navbar } from './navbar';

export function Page({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="main">{children}</main>
    </>
  );
}