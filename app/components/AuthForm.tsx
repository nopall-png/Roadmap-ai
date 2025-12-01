// app/components/AuthForm.tsx
import Link from "next/link";

type AuthFormProps = {
  type: "login" | "register";
};

export default function AuthForm({ type }: AuthFormProps) {
  const isLogin = type === "login";

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tighter">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-[#888888] mt-4 text-lg">
            {isLogin
              ? "Log in to continue designing your future"
              : "Start your journey with AI-powered roadmap"}
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {!isLogin && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="w-full px-6 py-4 bg-[#0D0D0D] border border-white/10 rounded-xl text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            className="w-full px-6 py-4 bg-[#0D0D0D] border border-white/10 rounded-xl text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="w-full px-6 py-4 bg-[#0D0D0D] border border-white/10 rounded-xl text-white placeholder-[#555555] focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 transition"
          />

          {/* Forgot Password (hanya di login) */}
          {isLogin && (
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-[#FF6B00] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {/* Submit Button — YANG PENTING: type="submit" */}
          <button
            type="submit"
            className="w-full py-5 bg-[#FF6B00] text-black font-bold text-lg rounded-xl 
                       hover:bg-[#ff8533] transition-all duration-300 
                       shadow-[0_0_30px_rgba(255,107,0,0.3)] 
                       hover:shadow-[0_0_50px_rgba(255,107,0,0.4)]"
          >
            {isLogin ? "Log In" : "Create Account"}
          </button>
        </div>

        {/* Divider & Switch Link */}
        <div className="mt-10 text-center">
          <p className="text-[#888888]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="text-[#FF6B00] font-semibold hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}