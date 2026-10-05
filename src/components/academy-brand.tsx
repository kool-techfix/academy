import Link from 'next/link';
import Image from 'next/image';

/*
 * Badge artwork. /public/Kool_TechFix_IT_Academy_Badge_Only.png is not in the
 * repo yet, so this points at the Cloudinary copy already in use (allowed in
 * next.config.ts). Once the file is added to /public, switch to:
 *   const BADGE_SRC = '/Kool_TechFix_IT_Academy_Badge_Only.png';
 * Set it to null to render the dashed placeholder instead.
 */
const BADGE_SRC: string | null =
  'https://res.cloudinary.com/dcvyjmflf/image/upload/v1791208209/Kool_TechFix_IT_Academy_Badge_Only.png';

export function Brand() {
  return (
    <Link href="/" className="brand" data-testid="link-brand">
      {BADGE_SRC ? (
        <Image width={48} height={48} src={BADGE_SRC} alt="" />
      ) : (
        // PLACEHOLDER: badge image not added yet.
        <span className="brand-badge-placeholder" aria-hidden="true" />
      )}
      <span className="brand-text">
        <span className="brand-wordmark">
          <span className="brand-line">
            Kool <span className="brand-word-green">Tech</span>Fix
          </span>{' '}
          <span className="brand-line">
            <span className="brand-word-red">I.T</span> Academy
          </span>
        </span>
        <span className="brand-motto">Learn · Apply · Innovate</span>
      </span>
    </Link>
  );
}
