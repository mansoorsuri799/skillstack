import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HomeSections from "@/components/HomeSections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HomeSections />
      </main>
      <Footer />
    </>
  );
}
