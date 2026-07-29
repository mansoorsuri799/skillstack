import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-[100svh] bg-[#010409] pt-24">{children}</main>
      <Footer />
    </>
  );
}
