// app/components/RecommendedSection.tsx
import Image from "next/image";
import Link from "next/link";

const topics = [
  "Software Engineer",
  "System Design",
  "Algorithms",
  "Web Development",
  "Cloud Computing",
  "Data Science",
  "Machine Learning",
  "DevOps",
] as const;

const courses = [
  {
    title: "Introduction to Programming - CS50",
    provider: "Harvard University",
    weeks: 12,
    level: "Beginner",
    image: "/images/courses/cs50.jpg",
  },
  {
    title: "System Design Fundamentals",
    provider: "Tech Interview Pro",
    weeks: 8,
    level: "Intermediate",
    image: "/images/courses/system-design.jpg",
  },
  {
    title: "Data Structures & Algorithms",
    provider: "MIT OpenCourseWare",
    weeks: 10,
    level: "Intermediate",
    image: "/images/courses/dsa.jpg",
  },
  {
    title: "Full Stack Web Development",
    provider: "The Odin Project",
    weeks: 16,
    level: "Advanced",
    image: "/images/courses/fullstack.jpg",
  },
  {
    title: "Cloud Architecture with AWS",
    provider: "AWS Training",
    weeks: 6,
    level: "Advanced",
    image: "/images/courses/aws.jpg",
  },
  {
    title: "Machine Learning Basics",
    provider: "Andrew Ng",
    weeks: 11,
    level: "Intermediate",
    image: "/images/courses/ml.jpg",
  },
];

export default function RecommendedSection() {
  return (
    <section className="my-20">
      {/* TOPICS */}
      <h2 className="text-4xl font-bold mb-10 bg-gradient-to-r from-white to-[#FF6B00] bg-clip-text text-transparent">
        Explore Recommended Topics
      </h2>

      <div className="flex flex-wrap gap-4 mb-16">
        {topics.map((topic, i) => (
          <button
            key={topic}
            className={`px-6 py-3 rounded-full font-medium transition-all hover:scale-105 shadow-lg ${
              i === 0
                ? "bg-[#FF6B00] text-black shadow-[#FF6B00]/40"
                : "bg-[#111] border border-white/10 text-[#ccc] hover:border-[#FF6B00]/50 hover:text-white"
            }`}
          >
            {topic}
          </button>
        ))}
      </div>

      {/* COURSE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Link
            href="#" // nanti ganti ke halaman course detail
            key={course.title}
            className="group block bg-[#111] border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF6B00]/40 transition-all duration-500 hover:shadow-2xl hover:shadow-[#FF6B00]/20"
          >
            <div className="relative h-48 bg-gradient-to-br from-gray-800 to-black overflow-hidden">
              <Image
                src={course.image}
                alt={course.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              {/* Level Badge */}
              <div className="absolute top-4 right-4 bg-black/80 backdrop-blur px-4 py-2 rounded-full text-xs font-bold">
                <span
                  className={`${
                    course.level === "Beginner"
                      ? "text-green-400"
                      : course.level === "Intermediate"
                      ? "text-yellow-amber-400"
                      : "text-red-400"
                  }`}
                >
                  {course.level}
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-white line-clamp-2 mb-2">
                {course.title}
              </h3>
              <p className="text-[#888] text-sm mb-6">{course.provider}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-[#888]">
                  <div className="w-4 h-4 bg-[#FF6B00] rounded-full animate-pulse" />
                  <span>{course.weeks} weeks</span>
                </div>
                <button className="px-5 py-2 border border-[#FF6B00]/30 text-[#FF6B00] rounded-full text-sm font-bold hover:bg-[#FF6B00]/10 transition">
                  Enroll
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}