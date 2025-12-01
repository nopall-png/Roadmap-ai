// app/register/page.tsx
import AuthForm from "@/app/components/AuthForm";

export default function RegisterPage() {
  return <AuthForm type="register" />;
}

export const metadata = {
  title: "Sign Up - Roadmap",
};