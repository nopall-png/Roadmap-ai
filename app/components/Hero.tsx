import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative w-full h-[700px] bg-black overflow-hidden">

      {/* LEFT CONTENT */}
      <div className="absolute left-10 top-24 max-w-2xl">
        <h1 className="text-[96px] leading-[96px] font-bold tracking-tighter text-white">
          Design <br />
          Your <br />
          Future.
        </h1>

        <p className="mt-8 max-w-lg text-[#888888] text-lg leading-8 font-light">
          Precision career roadmaps meets biometric security. The new standard for IT certification.
        </p>

        {/* TOMBOL SUDAH LINK KE /login + HOVER EFEK LENGKAP */}
        <Link
          href="/login"
          className="mt-12 inline-block px-8 py-4 bg-[#FF6B00] text-black font-semibold text-lg rounded-full 
                     shadow-[0_0_40px_rgba(255,107,0,0.4)] 
                     hover:shadow-[0_0_60px_rgba(255,107,0,0.5)] 
                     hover:bg-[#ff8533] 
                     transition-all duration-300"
        >
          Start Journey
        </Link>
      </div>

      {/* GAMBAR HERO — POSISI & STYLE SUDAH PAS */}
      <div className="absolute right-10 top-0 w-[640px] h-full">
        <div className="relative w-full h-full rounded-tl-[20px] rounded-bl-[20px] overflow-hidden">
          <Image
            src="/images/hero.jpg"
            alt="Person typing on keyboard"
            fill
            className="object-cover"
            priority
          />

          {/* Gradient overlay gelap — lebih halus & natural */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, transparent 80%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}