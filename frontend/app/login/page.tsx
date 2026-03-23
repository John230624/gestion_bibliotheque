import { LoginForm } from "@/components/AuthForms";

export default function LoginPage() {
  return (
    <main className="auth-page-shell">
      <section className="centered-page">
        <LoginForm />
      </section>
    </main>
  );
}
