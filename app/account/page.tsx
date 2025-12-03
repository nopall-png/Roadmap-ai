"use client";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const BACKEND = "http://127.0.0.1:5000";
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("authUser") : null;
      const u = raw ? JSON.parse(raw) : null;
      const q = u?.id ? `id=${u.id}` : u?.email ? `email=${encodeURIComponent(u.email)}` : "";
      if (!q) return;
      fetch(`${BACKEND}/user?${q}`).then(async (r) => {
        const data = await r.json();
        if (data?.user) setUser(data.user);
      }).catch(() => {});
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold">Account Settings</h1>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-[#888] text-sm">Name</p>
                <p className="text-xl font-semibold">{user?.name || "Guest"}</p>
              </div>
              <div>
                <p className="text-[#888] text-sm">Email</p>
                <p className="text-xl font-semibold">{user?.email || "-"}</p>
              </div>
            </div>
            <div className="mt-8 flex gap-4">
              <a href="/roadmap" className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5">Back to Dashboard</a>
              <button onClick={() => { localStorage.removeItem("authUser"); window.location.href = "/login"; }} className="px-6 py-3 rounded-xl bg-red-500 text-black font-bold hover:bg-red-400">Logout</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

