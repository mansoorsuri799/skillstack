import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardAppShell from "@/components/dashboard/DashboardAppShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return <DashboardAppShell>{children}</DashboardAppShell>;
}
