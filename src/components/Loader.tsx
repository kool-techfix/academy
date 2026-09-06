import Image from "next/image";

interface LoaderProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoaderProps) {
  return (
    <div className="app-loading-screen" role="status" aria-live="polite">
      <Image
        src="/images/images.png"
        alt="KoolTech Fix IT Academy"
        className="app-loading-mark"
        width={100}
        height={100}
      />
      <div className="loading-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{message}</p>
    </div>
  );
}
