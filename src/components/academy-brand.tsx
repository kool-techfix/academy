import Link from 'next/link';
import Image from 'next/image';

export function Brand() {
  return (
    <Link href="/" className="brand" data-testid="link-brand">
      <Image width={36} height={36} src="/images/images.png" alt="KoolTech Fix IT Academy mark" />
      <span>
        KoolTech Fix
        <small>IT Academy</small>
      </span>
    </Link>
  );
}