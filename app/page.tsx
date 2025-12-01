// Di file page.tsx Anda (ubah kode impor ini):
import Hero from "@/app/components/Hero";
import Features from "@/app/components/Features";
import Stats from "@/app/components/Stats";
import Footer from "@/app/components/Footer"; 

export default function Home() {
  return (
    <main className="bg-[#0A0A0A] text-white">
      <Hero />
      <Features />
      <Stats />z
      <Footer />
    </main>
  );
}
