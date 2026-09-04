import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Brand } from './academy-brand';
import { LanguageSwitch } from './language-switch';
import { getMockUserRole } from '@/lib/user';
import Link from 'next/link';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isAuth = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!accountOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [accountOpen]);

  if (isAuth) return null;

  const role = getMockUserRole();

  if (role === 'instructor') {
    return (
      <header className="navbar instructor-navbar">
        <div className="instructor-brand">
          <Brand />
          <span>Instructor</span>
        </div>
        <nav className="nav-links" aria-label="Instructor navigation">
          <Link
            href="/instructor"
            className={`nav-link ${pathname.startsWith('/instructor') ? 'active' : ''}`}
            data-testid="link-instructor-courses"
          >
            My Courses
          </Link>
        </nav>
        <div className="nav-actions">
          <div className="account-menu" ref={accountMenuRef}>
            <button
              className="avatar-link"
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              aria-label="Open account menu"
              onClick={() => setAccountOpen(!accountOpen)}
              data-testid="button-account-menu"
            >
              <span className="account-name">Daniel</span>
              <span className="avatar" aria-hidden="true" data-testid="text-user-avatar">DO</span>
            </button>
            {accountOpen && (
              <div className="account-dropdown" role="menu">
                <Link
                  href="/settings"
                  className="account-menu-item"
                  role="menuitem"
                  onClick={() => setAccountOpen(false)}
                  data-testid="link-account-settings"
                >
                  Settings
                </Link>
                <div className="account-menu-divider" />
                <button
                  className="account-menu-item"
                  role="menuitem"
                  onClick={() => {
                    setAccountOpen(false);
                    router.push('/');
                  }}
                  data-testid="button-log-out"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
          <button
            className="mobile-menu-button"
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setOpen(!open)}
            data-testid="button-mobile-menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {open && (
          <div className="mobile-panel">
            <Link
              href="/instructor"
              className="nav-link active"
              onClick={() => setOpen(false)}
              data-testid="link-mobile-instructor-courses"
            >
              My Courses
            </Link>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="navbar">
      <Brand />
      <nav className="nav-links" aria-label="Primary navigation">
        <Link
          href="/dashboard"
          className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
          data-testid="link-dashboard"
        >
          My learning
        </Link>
        <Link
          href="/catalog"
          className={`nav-link ${pathname === '/catalog' ? 'active' : ''}`}
          data-testid="link-catalog"
        >
          Course catalog
        </Link>
      </nav>
      <div className="nav-actions">
        <LanguageSwitch />
        <Link
          href="/catalog"
          className="button button-primary"
          data-testid="link-browse-courses"
        >
          Browse courses
        </Link>
        <div className="account-menu" ref={accountMenuRef}>
          <button
            className="avatar-link"
            aria-expanded={accountOpen}
            aria-haspopup="menu"
            aria-label="Open account menu"
            onClick={() => setAccountOpen(!accountOpen)}
            data-testid="button-account-menu"
          >
            <span className="account-name">Daniel</span>
            <span className="avatar" aria-hidden="true" data-testid="text-user-avatar">DO</span>
          </button>
          {accountOpen && (
            <div className="account-dropdown" role="menu">
              <Link
                href="/settings"
                className="account-menu-item"
                role="menuitem"
                onClick={() => setAccountOpen(false)}
                data-testid="link-account-settings"
              >
                Settings
              </Link>
              <div className="account-menu-divider" />
              <button
                className="account-menu-item"
                role="menuitem"
                onClick={() => {
                  setAccountOpen(false);
                  router.push('/');
                }}
                data-testid="button-log-out"
              >
                Log out
              </button>
            </div>
          )}
        </div>
        <button
          className="mobile-menu-button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setOpen(!open)}
          data-testid="button-mobile-menu"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {open && (
        <div className="mobile-panel">
          <Link
            href="/dashboard"
            className="nav-link"
            onClick={() => setOpen(false)}
            data-testid="link-mobile-dashboard"
          >
            My learning
          </Link>
          <Link
            href="/catalog"
            className="nav-link"
            onClick={() => setOpen(false)}
            data-testid="link-mobile-catalog"
          >
            Course catalog
          </Link>
        </div>
      )}
    </header>
  );
}