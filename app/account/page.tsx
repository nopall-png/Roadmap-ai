"use client";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const BACKEND = "http://127.0.0.1:5000";
  const [user, setUser] = useState<{ id?: number; name?: string; email?: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

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
              <button onClick={() => setConfirmDelete(true)} className="px-6 py-3 rounded-xl bg-[#111] border border-red-500 text-red-400 font-bold hover:bg-red-500/10">Delete Account</button>
            </div>
          </div>

          {confirmDelete && (
            <div className="bg-[#0a0a0a] border border-red-500 rounded-2xl p-6">
              <p className="text-red-400 font-bold mb-4">Are you sure you want to permanently delete your account?</p>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!user?.email && !user?.id) { setConfirmDelete(false); return; }
                    setDeleting(true);
                    try {
                      const res = await fetch(`${BACKEND}/delete-account`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: user?.email, id: user?.id }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        localStorage.removeItem("authUser");
                        router.push("/signup");
                      }
                    } catch {}
                    finally { setDeleting(false); setConfirmDelete(false); }
                  }}
                  disabled={deleting}
                  className={`px-6 py-3 rounded-xl font-bold ${deleting ? "bg-[#333]" : "bg-red-600 hover:bg-red-500"} text-black`}
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-6 py-3 rounded-xl bg-[#111] border border-white/10">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
