import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { useCurrentUser } from "@/hooks/auth/use-user";
import { LoadingScreen } from "./Loader";

export function Page({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();

  // useEffect(() => {
  //   if (!user) {
  //     window.location.href = "/login";
  //   }
  // }, [user]);

  if (isLoading) return <LoadingScreen />;

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="main">{children}</main>
    </>
  );
}
