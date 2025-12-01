// app/login/page.tsx
import AuthForm from "@/app/components/AuthForm";
import { redirect } from "next/navigation";

export default function LoginPage() {
  // Ini akan dipanggil saat form disubmit (via action)
  async function loginAction(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // DI SINI NANTI SAMBUNGIN KE AUTH (Supabase / NextAuth / custom API)
    // Contoh dummy login sukses:
    if (email && password) {
      // Simulasi login sukses → langsung redirect ke dashboard
      redirect("/dashboard");
    }

    // Kalau gagal (nanti bisa tambah error state)
    console.log("Login failed");
  }

  return (
    <form action={loginAction}>
      <AuthForm type="login" />
    </form>
  );
}

export const metadata = {
  title: "Log In - Roadmap",
};