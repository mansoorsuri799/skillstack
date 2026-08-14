import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeamChat from "@/components/TeamChat";
import { getExpertById } from "@/lib/team";

export const metadata: Metadata = {
  title: "Chat",
  robots: { index: false, follow: false },
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ expertId: string }>;
}) {
  const { expertId } = await params;
  const expert = getExpertById(expertId);
  if (!expert) notFound();

  return <TeamChat expert={expert} />;
}
