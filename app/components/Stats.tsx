export default function Stats() {
  return (
    <section className="py-32 bg-black"> {/* ← dari #050505 jadi black */}
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {[
            { value: "98%", label: "Student Satisfaction" },
            { value: "12K+", label: "Roadmaps Generated" },
            { value: "120+", label: "Career Paths" },
          ].map((stat, i) => (
            <div key={i} className="space-y-4">
              {/* Angka besar — warna oranye tetap biar jadi aksen */}
              <h3 className="text-6xl md:text-7xl font-bold text-[#FF6B00]">
                {stat.value}
              </h3>

              {/* Label — abu-abu terang biar kelihatan di hitam pekat */}
              <p className="text-[#AAAAAA] text-base md:text-lg tracking-wide">
                {stat.label}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}