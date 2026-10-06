import type { ReactNode } from 'react';
import { Brand } from '@/components/academy-brand';
import Link from 'next/link';

export function AuthLayout({
  activePage,
  children,
}: {
  activePage: 'login' | 'register';
  children: ReactNode;
}) {
  return (
    <div className="auth-shell">
      <section className="auth-visual">
        <Brand />
        <div className="auth-copy">
          <span className="eyebrow" style={{ color: 'var(--brand-gray)' }}>
            Practical skills. Visible progress.
          </span>
          <h1 style={{ marginTop: 12 }}>Learn the work behind the work.</h1>
          <p>
            KoolTech is a focused place to build IT skills that hold up when the room is busy and the answer is not obvious.
          </p>
        </div>
        <footer>© 2024 Kool TechFix I.T Academy</footer>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <nav className="auth-tabs" aria-label="Account access">
            <Link
              className={`auth-tab ${activePage === 'login' ? 'active' : ''}`}
              href="/login"
              aria-current={activePage === 'login' ? 'page' : undefined}
              data-testid="link-login-tab"
            >
              Sign in
            </Link>
            <Link
              className={`auth-tab ${activePage === 'register' ? 'active' : ''}`}
              href="/register"
              aria-current={activePage === 'register' ? 'page' : undefined}
              data-testid="link-register-tab"
            >
              Create account
            </Link>
          </nav>
          {children}
        </div>
      </section>
    </div>
  );
}