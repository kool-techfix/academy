import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Brand } from "./academy-brand";
import { LanguageSwitch } from "./language-switch";
import { useCurrentUser } from "@/hooks/auth/use-user";
import Link from "next/link";
import { useLogout } from "@/hooks/auth/use-logout";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isAuth = pathname === "/login" || pathname === "/register";
  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const handleLogout = async () => {
    setAccountOpen(false);

    try {
      await logout.mutateAsync();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    if (!accountOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  if (isAuth) return null;

  const role = user?.role;

  const href = role === "INSTRUCTOR" ? "/instructor/settings" : "/settings";

  // Instructor and admin share the dark "workspace" header.
  const workspace =
    role === "INSTRUCTOR"
      ? {
          label: "Instructor",
          links: [
            {
              href: "/instructor",
              label: "My Courses",
              testId: "instructor-courses",
              active: pathname.startsWith("/instructor"),
            },
          ],
        }
      : role === "ADMIN"
        ? {
            label: "Admin",
            links: [
              {
                href: "/admin",
                label: "Overview",
                testId: "admin-overview",
                active: pathname === "/admin",
              },
              {
                href: "/admin/instructors",
                label: "Instructors",
                testId: "admin-instructors",
                active: pathname.startsWith("/admin/instructors"),
              },
              {
                href: "/admin/courses",
                label: "Courses",
                testId: "admin-courses",
                active: pathname.startsWith("/admin/courses"),
              },
              {
                href: "/admin/users",
                label: "Users",
                testId: "admin-users",
                active: pathname.startsWith("/admin/users"),
              },
            ],
          }
        : null;

  if (workspace) {
    return (
      <header className="navbar instructor-navbar">
        <div className="instructor-brand">
          <Brand />
          <span>{workspace.label}</span>
        </div>
        <nav className="nav-links" aria-label={`${workspace.label} navigation`}>
          {workspace.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${link.active ? "active" : ""}`}
              data-testid={`link-${link.testId}`}
            >
              {link.label}
            </Link>
          ))}
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
              <span className="account-name">{user?.name || "User"}</span>
              <span
                className="avatar"
                aria-hidden="true"
                data-testid="text-user-avatar"
              >
                {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
              </span>
            </button>
            {accountOpen && (
              <div className="account-dropdown" role="menu">
                <Link
                  href={href}
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
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  data-testid="button-log-out"
                >
                  {logout.isPending ? "Logging out..." : "Log out"}
                </button>
              </div>
            )}
          </div>
          <button
            className="mobile-menu-button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen(!open)}
            data-testid="button-mobile-menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
        {open && (
          <div className="mobile-panel">
            {workspace.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${link.active ? "active" : ""}`}
                onClick={() => setOpen(false)}
                data-testid={`link-mobile-${link.testId}`}
              >
                {link.label}
              </Link>
            ))}
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
          className={`nav-link ${pathname === "/dashboard" ? "active" : ""}`}
          data-testid="link-dashboard"
        >
          My learning
        </Link>
        <Link
          href="/courses"
          className={`nav-link ${pathname === "/courses" ? "active" : ""}`}
          data-testid="link-courses"
        >
          Course catalog
        </Link>
      </nav>
      <div className="nav-actions">
        <LanguageSwitch />
        <Link
          href="/courses"
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
            <span className="account-name">{user?.name || "User"}</span>
            <span
              className="avatar"
              aria-hidden="true"
              data-testid="text-user-avatar"
            >
              {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
            </span>
          </button>
          {accountOpen && (
            <div className="account-dropdown" role="menu">
              <Link
                href={href}
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
                onClick={handleLogout}
                disabled={logout.isPending}
                data-testid="button-log-out"
              >
                {logout.isPending ? "Logging out..." : "Log out"}
              </button>
            </div>
          )}
        </div>
        <button
          className="mobile-menu-button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
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
            href="/courses"
            className="nav-link"
            onClick={() => setOpen(false)}
            data-testid="link-mobile-courses"
          >
            Course catalog
          </Link>
        </div>
      )}
    </header>
  );
}
