import { ArrowRight, GraduationCap, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { Page } from '@/components/page-shell';

export default function AdminDashboard() {
  return (
    <Page>
      <div className="page-head admin-page-head">
        <div>
          <span className="eyebrow">Academy administration</span>
          <h1>Admin overview</h1>
          <p>Keep instructor and learner accounts moving safely through the academy.</p>
        </div>
      </div>
      <div className="admin-entry-grid">
        <Link href="/admin/instructors" className="card admin-entry-card" data-testid="link-manage-instructors">
          <div className="admin-entry-icon"><ShieldCheck size={22} /></div>
          <div>
            <span className="eyebrow">People and access</span>
            <h2>Manage Instructors</h2>
            <p>Review approvals, update profiles, and control instructor access.</p>
          </div>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link href="/admin/learners" className="card admin-entry-card" data-testid="link-manage-learners">
          <div className="admin-entry-icon admin-entry-icon-coral"><GraduationCap size={22} /></div>
          <div>
            <span className="eyebrow">Learner accounts</span>
            <h2>Manage Learners</h2>
            <p>Update learner details and suspend or reinstate access.</p>
          </div>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </Page>
  );
}